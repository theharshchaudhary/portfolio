<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContentExporter;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    /** Full site content for the static build. */
    public function __invoke(ContentExporter $exporter): JsonResponse
    {
        return response()->json($exporter->export())->header('Cache-Control', 'no-store');
    }
}
