"""add new status in BookingStatus

Revision ID: 35c8f0c2ff73
Revises: 82044522682f
Create Date: 2026-07-19 17:40:44.155151

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '35c8f0c2ff73'
down_revision: Union[str, Sequence[str], None] = '82044522682f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE statusenum ADD VALUE 'pending'")

def downgrade() -> None:
    pass
