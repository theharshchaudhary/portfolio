<?php

namespace App\Filament\Pages;

use App\Filament\Support\SingletonPage;
use App\Models\SiteSetting;
use App\Services\GithubSync;
use App\Services\SiteBuilder;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Throwable;
use UnitEnum;

class SiteSettings extends SingletonPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Site';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Site settings';

    protected function record(): Model
    {
        return SiteSetting::current();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('rebuild')->label('Rebuild site now')->icon(Heroicon::OutlinedArrowPath)
                ->requiresConfirmation()
                ->action(function (SiteBuilder $builder) {
                    $build = $builder->dispatch('Manual rebuild from admin');
                    $notification = Notification::make()->title('Rebuild '.$build->status);
                    $build->status === 'dispatched'
                        ? $notification->success()->body('The site will be live with the latest content in a few minutes.')
                        : $notification->warning()->body($build->error);
                    $notification->send();
                }),
            Action::make('syncGithub')->label('Sync GitHub now')->icon(Heroicon::OutlinedCodeBracket)->color('gray')
                ->action(function (GithubSync $sync) {
                    try {
                        $result = $sync->run();
                        Notification::make()->success()->title('GitHub synced')
                            ->body("{$result['repos']} repos, {$result['projects_updated']} projects updated.")->send();
                    } catch (Throwable $e) {
                        Notification::make()->danger()->title('GitHub sync failed')->body($e->getMessage())->send();
                    }
                }),
        ];
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make()->persistTabInQueryString()->tabs([
                Tab::make('General')->icon(Heroicon::OutlinedGlobeAlt)->schema([
                    TextInput::make('site_name')->required(),
                    TextInput::make('tagline'),
                    TextInput::make('site_url')->url()->required()->helperText('Canonical URL, e.g. https://harshchaudhary.com.np'),
                    TextInput::make('footer_text')->helperText('{year} is replaced with the current year.'),
                ])->columns(2),

                Tab::make('SEO')->icon(Heroicon::OutlinedMagnifyingGlass)->schema([
                    TextInput::make('default_title')->required()->maxLength(70)
                        ->helperText('Home page title. Include your name and main keywords.'),
                    TextInput::make('title_template')->required()
                        ->helperText('%s is the page title and {site} the site name, e.g. "%s · {site}".'),
                    Textarea::make('default_description')->required()->rows(3)->maxLength(170)->columnSpanFull(),
                    FileUpload::make('default_og_image')->label('Default social image (1200×630)')
                        ->helperText('Used when a page has no image of its own. Pages also get auto-generated images.')
                        ->image()->disk('public')->directory('og')->maxSize(2048),
                ])->columns(2),

                Tab::make('Hero')->icon(Heroicon::OutlinedSparkles)->schema([
                    Radio::make('hero.mode')->label('Particles form')->options(['text' => 'Text', 'avatar' => 'My avatar'])->default('text')->inline(),
                    TextInput::make('hero.particleText')->label('Particle text')->maxLength(40),
                    TagsInput::make('hero.introLines')->label('Rotating intro lines')->columnSpanFull(),
                    Repeater::make('hero.ctas')->label('Buttons')->schema([
                        TextInput::make('label')->required(),
                        TextInput::make('href')->required()->placeholder('/projects'),
                        Select::make('style')->options(['primary' => 'Primary', 'secondary' => 'Secondary'])->default('primary'),
                    ])->columns(3)->maxItems(3)->reorderable()->columnSpanFull(),
                ])->columns(2),

                Tab::make('Contact & email')->icon(Heroicon::OutlinedEnvelope)->schema([
                    TextInput::make('contact_email')->email()->helperText('Shown publicly on the contact page.'),
                    TextInput::make('notify_email')->email()->helperText('Where contact form messages are sent. Defaults to the public email.'),
                ])->columns(2),

                Tab::make('Integrations')->icon(Heroicon::OutlinedPuzzlePiece)->schema([
                    TextInput::make('github_username')->prefix('github.com/'),
                    Section::make('Cloudflare Turnstile (spam protection)')->schema([
                        TextInput::make('turnstile_site_key'),
                        TextInput::make('turnstile_secret_key')->password()->revealable()
                            ->placeholder(fn () => filled($this->record()->turnstile_secret_key) ? '•••••••• (saved)' : null)
                            ->helperText('Leave empty to keep the saved secret.'),
                    ])->columns(2)->columnSpanFull(),
                    TextInput::make('indexnow_key')->label('IndexNow key')
                        ->suffixAction(Action::make('generate')->icon(Heroicon::OutlinedArrowPath)
                            ->action(fn (Set $set) => $set('indexnow_key', Str::lower(Str::random(32)))))
                        ->helperText('Lets Bing and other engines index new pages within minutes.'),
                ])->columns(2),

                Tab::make('Behaviour')->icon(Heroicon::OutlinedAdjustmentsHorizontal)->schema([
                    Toggle::make('auto_rebuild')->label('Rebuild the site automatically after every change'),
                    Toggle::make('analytics_enabled')->label('Count page views (cookieless)'),
                ]),
            ]),
        ]);
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        unset($data['turnstile_secret_key']);

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (blank($data['turnstile_secret_key'] ?? null)) {
            unset($data['turnstile_secret_key']);
        }

        return $data;
    }
}
