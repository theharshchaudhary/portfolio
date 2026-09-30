<x-mail::message>
# New contact message

**From:** {{ $contact->name }} ({{ $contact->email }})
@if ($contact->subject)
**Subject:** {{ $contact->subject }}
@endif

<x-mail::panel>
{{ $contact->body }}
</x-mail::panel>

Reply to this email to answer {{ $contact->name }} directly.

<x-mail::button :url="url('/admin/messages')">
Open inbox
</x-mail::button>
</x-mail::message>
