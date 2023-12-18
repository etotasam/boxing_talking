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
            $this->dataToCSV('boxers');
            $this->dataToCSV('users');
            $this->dataToCSV('comments');
            $this->dataToCSV('organizations');
            $this->dataToCSV('weight_divisions');
            $this->dataToCSV('title_matches');
            $this->dataToCSV('titles');
            $this->dataToCSV('win_loss_predictions');
        } catch (Exception $e) {
            return response()->json(["error" => $e->getMessage()]);
        }

        return response()->json(["message" => "Success save DB data to csv"]);
    }

    /**
     * @param string $tableName csv変換したいテーブル名
     */
    protected function dataToCSV(string $tableName)
    {
        try {
            $tableData = DB::table($tableName)->get();
            //header行の作成
            $headerRow = implode(',', array_keys((array) $tableData->first()));
            $csvData = $headerRow . "\n";
            // データをCSV形式に変換
            foreach ($tableData as $record) {
                $csvData .= implode(',', (array) $record) . "\n";
            }
            // CSVファイルを保存
            $createDate = date('Ymd');
            $filename = $createDate . '_' . $tableName . '.csv';
            \Storage::put('csv/' . $filename, $csvData);
        } catch (Exception $e) {
            throw new Exception("Failed " . $tableName . " data to csv");
        }
    }
}
