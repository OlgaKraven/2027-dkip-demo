"""An isolated pgAdmin profile for capturing this course, without touching saved servers."""
import os,sys,runpy,builtins
from pathlib import Path
web=Path(r'C:\Program Files\PostgreSQL\18\pgAdmin 4\web')
data=Path(__file__).resolve().parents[1]/'.runtime/pgadmin';data.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(web));os.environ['PGADMIN_SERVER_MODE']='OFF';os.environ['PGADMIN_INT_PORT']='5199';builtins.SERVER_MODE=False
import config
config.SERVER_MODE=False;config.DATA_DIR=str(data);config.SQLITE_PATH=str(data/'pgadmin4.db');config.LOG_FILE=str(data/'pgadmin4.log');config.SESSION_DB_PATH=str(data/'sessions');config.STORAGE_DIR=str(data/'storage');config.DEFAULT_SERVER_PORT=5199;config.MASTER_PASSWORD_REQUIRED=False
for p in ['sessions','storage']: (data/p).mkdir(exist_ok=True)
runpy.run_path(str(web/'pgAdmin4.py'),run_name='__main__')
