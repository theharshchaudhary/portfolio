<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'subject', 'body', 'ip_hash', 'user_agent', 'is_spam'])]
class Message extends Model
{
    protected function casts(): array
    {
        return [
            'is_spam' => 'boolean',
            'read_at' => 'datetime',
        ];
    }
}
