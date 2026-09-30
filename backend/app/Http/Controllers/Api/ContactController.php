<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageReceived;
use App\Models\Message;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'subject' => ['nullable', 'string', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'string'], // honeypot: hidden from real visitors
            'turnstileToken' => ['nullable', 'string'],
        ]);

        $settings = SiteSetting::current();
        $isSpam = filled($data['website'] ?? null);

        if (! $isSpam && filled($settings->turnstile_secret_key)
            && ! $this->passesTurnstile($settings->turnstile_secret_key, $data['turnstileToken'] ?? null, $request->ip())) {
            throw ValidationException::withMessages(['turnstileToken' => 'Verification failed. Please try again.']);
        }

        $message = Message::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'body' => $data['message'],
            'ip_hash' => hash_hmac('sha256', (string) $request->ip(), config('app.key')),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'is_spam' => $isSpam,
        ]);

        // Bots get the same success response so they can't tell the trap fired.
        $to = $settings->notify_email ?: $settings->contact_email;
        if (! $isSpam && filled($to)) {
            defer(fn () => Mail::to($to)->send(new ContactMessageReceived($message)));
        }

        return response()->json(['ok' => true], 201);
    }

    private function passesTurnstile(string $secret, ?string $token, ?string $ip): bool
    {
        if (blank($token)) {
            return false;
        }

        $response = Http::asForm()->timeout(8)->post(config('services.turnstile.verify_url'), [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        return $response->ok() && $response->json('success') === true;
    }
}
