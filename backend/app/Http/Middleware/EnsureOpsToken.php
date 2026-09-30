<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Guards CI-only endpoints with the shared OPS_TOKEN (Bearer). If the token is unset, the endpoints don't exist. */
class EnsureOpsToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = config('services.ops.token');

        abort_if(blank($token), 404);
        abort_unless(is_string($request->bearerToken()) && hash_equals($token, $request->bearerToken()), 401);

        return $next($request);
    }
}
