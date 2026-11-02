"""隔離DBだけに接続する更新前検査。データや設定は変更しない。"""
import os
import sys

print("P5_PHASE=script_started", file=sys.stderr, flush=True)
targets = {
    "db80": ("8.0.21", "p5-baseline-db80", "8.0.46"),
    "relay80": ("8.0.46", "p5-relay-db80", "8.4.13"),
}
source = sys.argv[1] if len(sys.argv) == 2 else ""
if source not in targets:
    raise RuntimeError("Refused unknown upgrade source")
version, hostname, target = targets[source]
password = os.environ.get("P5_CHECK_PASSWORD", "")
if not password:
    raise RuntimeError("Synthetic checker credential missing")

# mysql/utilはMySQL ShellのPython実行環境から提供される。
connection = {"host": source, "port": 3306, "user": "p5_checker", "password": password,
              "ssl-mode": "REQUIRED", "connect-timeout": 10000}
session = mysql.get_session(connection)
identity = session.run_sql("SELECT @@version, @@hostname").fetch_one()
if identity[0] != version or identity[1] != hostname:
    session.close()
    raise RuntimeError("Refused server identity")
session.close()
print("P5_PHASE=identity_verified", file=sys.stderr, flush=True)
print("P5_PHASE=checking target=" + target, file=sys.stderr, flush=True)
util.check_for_server_upgrade(connection, {
    "targetVersion": target,
    "outputFormat": "JSON",
    "configPath": "/p5-config/" + source + ".cnf",
    "checkTimeout": 60,
})
print("P5_PHASE=check_finished", file=sys.stderr, flush=True)
