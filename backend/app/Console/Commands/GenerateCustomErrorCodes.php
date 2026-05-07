<?php

namespace App\Console\Commands;

use App\Exceptions\CustomErrorCodes;
use Illuminate\Console\Command;
use ReflectionClass;

class GenerateCustomErrorCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'custom-error-codes:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate frontend custom error code constants from backend constants';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $outputPath = base_path(config('custom_error_codes.frontend_output_path'));
        file_put_contents($outputPath, $this->buildTypescriptContent());

        $this->info("Generated {$outputPath}");

        return 0;
    }

    private function buildTypescriptContent(): string
    {
        $reflection = new ReflectionClass(CustomErrorCodes::class);
        $codes = $reflection->getConstants();

        $lines = [
            'export const CUSTOM_ERROR_CODE = {',
        ];

        foreach ($codes as $name => $value) {
            $lines[] = "  {$name}: {$value},";
        }

        $lines[] = '} as const;';
        $lines[] = '';

        return implode(PHP_EOL, $lines);
    }
}
