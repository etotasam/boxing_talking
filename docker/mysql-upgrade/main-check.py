# 実.envを参照せず、既存コンテナから一時継承した資格情報だけで検査する。
import os,sys,json
host=os.environ['P5_CHECK_HOST'];version=os.environ['P5_CHECK_VERSION'];hostname=os.environ['P5_CHECK_HOSTNAME'];target=os.environ['P5_CHECK_TARGET']
assert (host,version,target) in [('db','8.0.21','8.0.46'),('p5-main-relay80','8.0.46','8.4.13')]
print('P5_MAIN script_started',file=sys.stderr,flush=True)
connection={'host':host,'port':3306,'user':'root','password':os.environ['P5_CHECK_PASSWORD'],'schema':os.environ['P5_CHECK_DATABASE'],'ssl-mode':'REQUIRED','connect-timeout':10000}
session=mysql.get_session(connection)
identity=session.run_sql('SELECT @@version,@@hostname,DATABASE()').fetch_one()
assert list(identity)==[version,hostname,os.environ['P5_CHECK_DATABASE']]
assert session.run_sql("SHOW SESSION STATUS LIKE 'Ssl_cipher'").fetch_one()[1]
print('P5_MAIN identity_verified',file=sys.stderr,flush=True)
if os.environ.get('P5_CHECK_PROBE')=='1':
 print(json.dumps({'identity_verified':True,'tls':True,'version':version}))
else:
 print('P5_MAIN checking '+target,file=sys.stderr,flush=True)
 util.check_for_server_upgrade(connection,{'targetVersion':target,'outputFormat':'JSON','configPath':'/p5-cnf/'+os.environ['P5_CHECK_CNF'],'checkTimeout':60})
 print('P5_MAIN check_finished',file=sys.stderr,flush=True)
session.close()
