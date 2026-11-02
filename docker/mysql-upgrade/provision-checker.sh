#!/bin/sh
# 隔離baselineに検査専用アカウントを作る。元DBでは実行しない。
set -eu
case "${1:-db80}" in
  db80) expected_db=boxing_p5_baseline; expected_identity='8.0.21/p5-baseline-db80' ;;
  relay80) expected_db=boxing_p5_relay80; expected_identity='8.0.46/p5-relay-db80' ;;
  *) exit 1 ;;
esac
[ "$MYSQL_DATABASE" = "$expected_db" ]
case "$MYSQL_PASSWORD" in ''|*[!a-f0-9]*) exit 1 ;; esac
export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
identity=$(mysql -uroot --batch --skip-column-names --execute='SELECT CONCAT(@@version, "/", @@hostname)')
[ "$identity" = "$expected_identity" ]
exists=$(mysql -uroot --batch --skip-column-names --execute="SELECT COUNT(*) FROM mysql.user WHERE User = 'p5_checker'")
[ "$exists" = 0 ]
mysql -uroot --execute="CREATE USER 'p5_checker'@'%' IDENTIFIED WITH caching_sha2_password BY '$MYSQL_PASSWORD'; GRANT PROCESS, SELECT ON *.* TO 'p5_checker'@'%';"
echo 'Isolated checker account provisioned.'
