import os
import sys
from alembic.config import Config
from alembic import command

sys.path.insert(0, os.getcwd())

cfg = Config("alembic.ini")
cfg.set_main_option("script_location", "backend/src/migrations")

# Запускаем обновление базы
command.upgrade(cfg, "head")
print("--- БАЗА ДАННЫХ ОБНОВЛЕНА УСПЕШНО ---")