<?php

namespace App\Filament\Resources\SupportMethods\Pages;

use App\Filament\Resources\SupportMethods\SupportMethodResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageSupportMethods extends ManageRecords
{
    protected static string $resource = SupportMethodResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
