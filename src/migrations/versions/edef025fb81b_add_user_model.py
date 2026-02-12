"""add user model

Revision ID: edef025fb81b
Revises: 
Create Date: 2026-02-12 17:39:54.827763

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'edef025fb81b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('surname', sa.String(), nullable=False),
    sa.Column('age', sa.Integer(), nullable=False),
    sa.Column('phone', sa.String(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('city', sa.String(), nullable=False),
    sa.Column('address', sa.String(), nullable=False),
    sa.Column('lat', sa.Numeric(), nullable=False),
    sa.Column('lon', sa.Numeric(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )



def downgrade() -> None:

    op.drop_table('users')

