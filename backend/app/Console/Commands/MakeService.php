<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:service {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Service class';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $name = $this->argument('name');
        $path = app_path("Services/{$name}.php");

        // ディレクトリがなければ作成
        if (!File::exists(app_path('Services'))) {
            File::makeDirectory(app_path('Services'), 0755, true);
        }

        // ファイルが既に存在していればエラー
        if (File::exists($path)) {
            $this->error("Service {$name} already exists!");
            return;
        }

        $template = "<?php

namespace App\Services;

class {$name}
{
    public function __construct(
  ) {}
}
";

        // テンプレートをファイルに書き込む
        File::put($path, $template);

        // 成功メッセージを表示
        $this->info("Service {$name} created successfully.");
    }
}
