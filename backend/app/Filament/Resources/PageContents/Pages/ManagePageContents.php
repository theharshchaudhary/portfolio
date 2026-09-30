<?php

namespace App\Filament\Resources\PageContents\Pages;

use App\Filament\Resources\PageContents\PageContentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManagePageContents extends ManageRecords
{
    protected static string $resource = PageContentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
