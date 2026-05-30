import sys
import os
from alembic.config import Config
from alembic import command

# Фиксим пути для твоих импортов backend.src
sys.path.insert(0, os.getcwd())

cfg = Config("alembic.ini")
# МЫ ЖЕСТКО ПРОПИСЫВАЕМ ПУТЬ ТУТ:
cfg.set_main_option("script_location", "backend/src/migrations")

command.revision(cfg, message="add baskets model", autogenerate=True)