<?php

/**
 * Release unpacker for the FTPS-only host (served as public/_unpack.php).
 *
 * File-by-file FTP is ~2s per file and the server drops long sessions, so CI uploads one tarball
 * to ../_releases/ and calls this script to install it. Deliberately standalone (no Laravel): it
 * must work before vendor/ exists and while vendor/ is being replaced.
 *
 * Two kinds of release share public/:
 *   app   backend code + Laravel's public files (index.php, Filament assets, this script)
 *   site  the prerendered static site (HTML, JS, CSS, images, .htaccess, sitemap, feeds)
 * Each release lists its public/ entries in public/.app-files or public/.site-files, so installing
 * one kind carries the other kind's files over. public/ itself is swapped with a single rename.
 *
 *   POST ?action=start&kind=app|site&sha=<commit>    extract + swap after responding 202
 *   POST ?action=status&kind=app|site&sha=<commit>   {"state": "running|done|error", ...}
 *
 * Both require the X-Ops-Token header to match OPS_TOKEN in ../.env.
 */

$appRoot = dirname(__DIR__);
$releases = $appRoot.'/_releases';

// Runtime state that must survive deploys and is never shipped in a release.
const KEEP = ['.env', 'storage', '_releases'];
const MANIFEST = ['app' => '.app-files', 'site' => '.site-files'];

function respond(int $code, array $body): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($body);
}

function opsToken(string $appRoot): string
{
    $env = @file_get_contents($appRoot.'/.env') ?: '';

    return preg_match('/^OPS_TOKEN=("?)([^"\r\n]*)\1\s*$/m', $env, $m) ? $m[2] : '';
}

function removeTree(string $path): void
{
    if (is_link($path) || is_file($path)) {
        @unlink($path);

        return;
    }
    if (! is_dir($path)) {
        return;
    }
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
        $item->isDir() && ! $item->isLink() ? @rmdir($item->getPathname()) : @unlink($item->getPathname());
    }
    @rmdir($path);
}

function copyTree(string $from, string $to): void
{
    if (is_link($from)) {
        symlink(readlink($from), $to);

        return;
    }
    if (is_file($from)) {
        copy($from, $to) || throw new RuntimeException("Could not copy $from");

        return;
    }
    mkdir($to, 0755, true);
    foreach (scandir($from) as $name) {
        if ($name !== '.' && $name !== '..') {
            copyTree("$from/$name", "$to/$name");
        }
    }
}

/** Create any directory or file of the bundled storage/ skeleton that doesn't exist yet. */
function mergeSkeleton(string $from, string $to): void
{
    $items = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($from, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    foreach ($items as $item) {
        $target = $to.'/'.substr($item->getPathname(), strlen($from) + 1);
        if ($item->isDir() && ! is_dir($target)) {
            mkdir($target, 0755, true);
        } elseif ($item->isFile() && ! file_exists($target)) {
            copy($item->getPathname(), $target);
        }
    }
}

/** Entries listed in a public/ manifest (one top-level name per line). */
function manifest(string $publicDir, string $file): array
{
    $lines = @file("$publicDir/$file", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

    return array_values(array_filter($lines, fn ($n) => $n !== '' && ! str_contains($n, '/') && $n !== '.' && $n !== '..'));
}

/** Build the next public/: the new release's files + the other kind's current files + the uploads link. */
function assemblePublic(string $newPublic, string $currentPublic, string $otherKind): void
{
    if (! is_dir($currentPublic)) {
        return;
    }
    $other = MANIFEST[$otherKind];
    foreach (array_merge(manifest($currentPublic, $other), [$other]) as $name) {
        if (file_exists("$currentPublic/$name") && ! file_exists("$newPublic/$name")) {
            copyTree("$currentPublic/$name", "$newPublic/$name");
        }
    }
    if (is_link("$currentPublic/uploads") && ! file_exists("$newPublic/uploads")) {
        symlink(readlink("$currentPublic/uploads"), "$newPublic/uploads");
    }
}

$token = opsToken($appRoot);
$sha = $_GET['sha'] ?? '';
$kind = $_GET['kind'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $token === ''
    || ! hash_equals($token, $_SERVER['HTTP_X_OPS_TOKEN'] ?? '')
    || ! preg_match('/^[0-9a-f]{40}$/', $sha) || ! isset(MANIFEST[$kind])) {
    respond(404, ['message' => 'Not found']);
    exit;
}

$statusFile = "$releases/status-$kind-$sha.json";
$writeStatus = fn (array $s) => file_put_contents($statusFile, json_encode($s + ['at' => date('c')]));

if (($_GET['action'] ?? '') === 'status') {
    respond(200, is_file($statusFile) ? json_decode(file_get_contents($statusFile), true) : ['state' => 'unknown']);
    exit;
}

$tarball = "$releases/$kind-$sha.tar.gz";
if (! is_file($tarball)) {
    respond(422, ['message' => "Missing $kind-$sha.tar.gz"]);
    exit;
}

// Answer now and keep working: extraction outlives an HTTP request comfortably.
ignore_user_abort(true);
@set_time_limit(900);
$writeStatus(['state' => 'running']);
respond(202, ['state' => 'running']);
if (function_exists('litespeed_finish_request')) {
    litespeed_finish_request();
} elseif (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

$staging = "$releases/new-$kind-$sha";
$retired = "$releases/old-$kind-$sha";
$swapped = [];

try {
    $started = microtime(true);

    // Clear leftovers of earlier installs (keeps tarballs and status files).
    foreach (glob("$releases/{new,old}-*", GLOB_BRACE) as $old) {
        removeTree($old);
    }

    (new PharData($tarball))->extractTo($staging, null, true);
    mkdir($retired, 0755, true);

    if ($kind === 'app') {
        if (! is_file("$staging/artisan") || ! is_dir("$staging/vendor") || ! is_file("$staging/public/index.php")) {
            throw new RuntimeException('App release is incomplete (artisan, vendor/ or public/index.php missing).');
        }
        assemblePublic("$staging/public", "$appRoot/public", 'site');
        // Before the first site release there are no routing rules yet; Laravel's fallback keeps
        // /api reachable so CI can run post-deploy tasks. A site release always brings its own.
        if (! is_file("$staging/public/.htaccess") && is_file("$staging/public/.htaccess.app")) {
            copy("$staging/public/.htaccess.app", "$staging/public/.htaccess");
        }
        $entries = array_diff(scandir($staging), ['.', '..']);
    } else {
        if (! is_file("$staging/index.html") || ! is_file("$staging/.htaccess")) {
            throw new RuntimeException('Site release is incomplete (index.html or .htaccess missing).');
        }
        // The site tarball is public/'s content; wrap it so the swap below treats it like app's public/.
        $site = "$releases/site-$sha-content";
        rename($staging, $site);
        mkdir($staging, 0755, true);
        rename($site, "$staging/public");
        assemblePublic("$staging/public", "$appRoot/public", 'app');
        $entries = ['public'];
    }

    foreach ($entries as $name) {
        if ($name === 'storage') {
            mergeSkeleton("$staging/storage", "$appRoot/storage");
            continue;
        }
        if (in_array($name, KEEP, true)) {
            continue;
        }
        // Two renames per entry, so each path is missing for microseconds.
        if (file_exists("$appRoot/$name") || is_link("$appRoot/$name")) {
            rename("$appRoot/$name", "$retired/$name") || throw new RuntimeException("Could not retire $name");
        }
        rename("$staging/$name", "$appRoot/$name") || throw new RuntimeException("Could not install $name");
        $swapped[] = $name;
    }

    removeTree($retired);
    removeTree($staging);
    @unlink($tarball);
    foreach (glob("$releases/status-*.json") as $old) {
        if ($old !== $statusFile && filemtime($old) < time() - 86400) {
            @unlink($old);
        }
    }

    $writeStatus(['state' => 'done', 'seconds' => round(microtime(true) - $started, 1), 'installed' => $swapped]);
} catch (Throwable $e) {
    // Put back whatever was already swapped so the previous release keeps serving; entries this
    // release added (no previous version) are removed.
    foreach (array_reverse($swapped) as $name) {
        removeTree("$appRoot/$name");
        if (file_exists("$retired/$name") || is_link("$retired/$name")) {
            @rename("$retired/$name", "$appRoot/$name");
        }
    }
    $writeStatus(['state' => 'error', 'message' => $e->getMessage()]);
}
