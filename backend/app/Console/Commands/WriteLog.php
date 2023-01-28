<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class WriteLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'writelog:info';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'write info message in log file';

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
        logger()->info('This is WriteLog Command.');
    }
}
