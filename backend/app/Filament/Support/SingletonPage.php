<?php

namespace App\Filament\Support;

use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;

/** An admin page that edits the single row of a settings-style model. */
abstract class SingletonPage extends Page
{
    /** @var array<string, mixed>|null */
    public ?array $data = [];

    abstract protected function record(): Model;

    public function mount(): void
    {
        $this->form->fill($this->mutateFormDataBeforeFill($this->record()->attributesToArray()));
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema
            ->model($this->record())
            ->operation('edit')
            ->statePath('data');
    }

    public function content(Schema $schema): Schema
    {
        return $schema->components([
            Form::make([EmbeddedSchema::make('form')])
                ->id('form')
                ->livewireSubmitHandler('save')
                ->footer([
                    Actions::make([
                        Action::make('save')->label('Save changes')->submit('save')->keyBindings(['mod+s']),
                    ])->sticky()->key('form-actions'),
                ]),
        ]);
    }

    public function save(): void
    {
        $record = $this->record();
        $record->update($this->mutateFormDataBeforeSave($this->form->getState()));
        $this->form->model($record)->saveRelationships();

        Notification::make()->success()->title('Saved')->body('The site will rebuild with your changes.')->send();
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return $data;
    }
}
