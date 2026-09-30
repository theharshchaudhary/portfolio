<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Reads profile data (GraphQL needs a token; a fine-grained token with no extra scopes is enough).
    'github' => [
        'token' => env('GITHUB_TOKEN'),
        'username' => env('GITHUB_USERNAME'),
    ],

    // Triggers the frontend rebuild workflow via repository_dispatch.
    'site_build' => [
        'repo' => env('SITE_BUILD_REPO', 'theharshchaudhary/portfolio'),
        'token' => env('SITE_BUILD_TOKEN'),
        'event' => env('SITE_BUILD_EVENT', 'content-updated'),
    ],

    'turnstile' => [
        'verify_url' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    ],

    // Shared secret for CI-only endpoints (GitHub sync, migrations, status).
    'ops' => [
        'token' => env('OPS_TOKEN'),
    ],

];
