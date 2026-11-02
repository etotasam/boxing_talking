<?php
// 実.envを読み込まず、承認済み接続先の全内容・構造をhashだけで記録する。
function ensureMainP5(bool $ok,string $why):void{if(!$ok)throw new RuntimeException($why);}
try {
 $host=getenv('DB_HOST');$version=getenv('P5_EXPECTED_VERSION');$hostname=getenv('P5_EXPECTED_HOSTNAME');$database=getenv('DB_DATABASE');$mode=$argv[1]??'snapshot';
 ensureMainP5(in_array($host,['db','p5-main-relay80','p5-main-db84'],true)&&in_array($version,['8.0.21','8.0.46','8.4.13'],true)&&$hostname!==''&&$database!=='','Unsafe expected identity');
 ensureMainP5(in_array($mode,['snapshot','empty'],true),'Unsafe mode');
 $pdo=new PDO('mysql:host='.$host.';port=3306;charset=utf8mb4',getenv('DB_USERNAME'),getenv('DB_PASSWORD'),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_STRINGIFY_FETCHES=>true]);
 $pdo->exec('USE `'.str_replace('`','``',$database).'`');
 $i=$pdo->query('SELECT @@version v,@@hostname h,DATABASE() d')->fetch(PDO::FETCH_ASSOC);
 ensureMainP5([$i['v'],$i['h'],$i['d']]===[$version,$hostname,$database],'Unexpected server identity');
 $pdo->exec("SET time_zone = '+00:00'");
 $query=function($sql,$params=[])use($pdo){$s=$pdo->prepare($sql);$s->execute($params);return $s->fetchAll(PDO::FETCH_ASSOC);};
 $tables=$pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);sort($tables);
 if($mode==='empty'){ensureMainP5($host!=='db'&&$tables===[],'Destination must be empty');echo json_encode(['empty'=>true,'version'=>$version])."\n";exit(0);}
 ensureMainP5(count($tables)===20&&(int)$pdo->query('SELECT COUNT(*) FROM migrations')->fetchColumn()===53,'Unexpected inventory');
 $out=['version'=>$version,'tables'=>[]];
 foreach($tables as $table){
  ensureMainP5((bool)preg_match('/^[a-z0-9_]+$/D',$table),'Unsafe table name');$rows=[];
  foreach($query('SELECT * FROM `'.$table.'`') as $row){ksort($row);$rows[]=json_encode($row,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);}sort($rows,SORT_STRING);
  $columns=$query('SELECT ORDINAL_POSITION,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_DEFAULT,EXTRA,CHARACTER_SET_NAME,COLLATION_NAME,GENERATION_EXPRESSION FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY ORDINAL_POSITION',[$table]);
  foreach($columns as &$col){if($col['CHARACTER_SET_NAME']==='utf8')$col['CHARACTER_SET_NAME']='utf8mb3';if(is_string($col['COLLATION_NAME'])&&str_starts_with($col['COLLATION_NAME'],'utf8_'))$col['COLLATION_NAME']='utf8mb3_'.substr($col['COLLATION_NAME'],5);}unset($col);
  $indexes=$query('SELECT INDEX_NAME,NON_UNIQUE,SEQ_IN_INDEX,COLUMN_NAME,COLLATION,SUB_PART,INDEX_TYPE,IS_VISIBLE,EXPRESSION FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? ORDER BY INDEX_NAME,SEQ_IN_INDEX',[$table]);
  $foreign=$query('SELECT k.CONSTRAINT_NAME,k.COLUMN_NAME,k.ORDINAL_POSITION,k.REFERENCED_TABLE_NAME,k.REFERENCED_COLUMN_NAME,r.UPDATE_RULE,r.DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME AND r.TABLE_NAME=k.TABLE_NAME WHERE k.TABLE_SCHEMA=DATABASE() AND k.TABLE_NAME=? ORDER BY k.CONSTRAINT_NAME,k.ORDINAL_POSITION',[$table]);
  $checks=$query('SELECT tc.CONSTRAINT_NAME,cc.CHECK_CLAUSE,tc.ENFORCED FROM information_schema.TABLE_CONSTRAINTS tc JOIN information_schema.CHECK_CONSTRAINTS cc ON cc.CONSTRAINT_SCHEMA=tc.CONSTRAINT_SCHEMA AND cc.CONSTRAINT_NAME=tc.CONSTRAINT_NAME WHERE tc.TABLE_SCHEMA=DATABASE() AND tc.TABLE_NAME=? AND tc.CONSTRAINT_TYPE=\'CHECK\' ORDER BY tc.CONSTRAINT_NAME',[$table]);
  $state=$query('SELECT ENGINE,AUTO_INCREMENT,TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?',[$table])[0];ensureMainP5($state['ENGINE']==='InnoDB','Nontransactional table');if(str_starts_with($state['TABLE_COLLATION'],'utf8_'))$state['TABLE_COLLATION']='utf8mb3_'.substr($state['TABLE_COLLATION'],5);
  $schema=['columns'=>$columns,'indexes'=>$indexes,'foreign_keys'=>$foreign,'checks'=>$checks,'state'=>$state];$out['tables'][$table]=['count'=>count($rows),'data_sha256'=>hash('sha256',json_encode($rows,JSON_THROW_ON_ERROR)),'schema_sha256'=>hash('sha256',json_encode($schema,JSON_THROW_ON_ERROR)),'schema'=>$schema];
 }
 echo json_encode($out,JSON_PRETTY_PRINT|JSON_THROW_ON_ERROR)."\n";
}catch(Throwable $error){fwrite(STDERR,'Main P5 snapshot failed: '.get_class($error)."\n");exit(1);}
