<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;


class DbDataToCsvController extends Controller
{
    /**
     * DBデータをcsvに保存する
     * @return string
     */
    public function output()
    {
        try {
            $this->createCSV('administrators');
            $this->createCSV('boxers');
            $this->createCSV('boxing_matches');
            $this->createCSV('comments');
            $this->createCSV('users');
            $this->createCSV('match_results');
            $this->createCSV('organizations');
            $this->createCSV('weight_divisions');
            $this->createCSV('title_matches');
            $this->createCSV('titles');
            $this->createCSV('win_loss_predictions');
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()]);
        }

        return response()->json(["message" => "Success save DB data to csv"]);
    }


    protected function createCSV(string $tableName)
    {
        try {
            $tableData = DB::table($tableName)->get();
            $createDate = date('Ymd');
            $filename = $tableName . '.csv';
            $directoryPath = storage_path('csv/' . $createDate);
            $filePath = $directoryPath . '/' . $filename;

            // ディレクトリが存在しない場合は作成
            if (!file_exists($directoryPath)) {
                mkdir($directoryPath, 0755, true);
            }

            // ファイルをストリームモードで開く
            $handle = fopen($filePath, 'w');

            // header 行の書き込み
            fputcsv($handle, array_keys((array) $tableData->first()));

            // データを CSV 形式に変換して書き込む
            foreach ($tableData as $record) {
                fputcsv($handle, (array) $record);
            }

            // ファイルを閉じる
            fclose($handle);
        } catch (Exception $e) {
            throw new Exception("Failed " . $tableName . " data to csv :" . $e->getMessage());
        }
    }
}
