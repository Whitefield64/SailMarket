"""add_blueprint_fields

Revision ID: 003
Revises: 7438dc26c773
Create Date: 2025-10-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '003'
down_revision = '7438dc26c773'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add blueprint-related fields to reports table
    op.add_column('reports', sa.Column('blueprint', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('reports', sa.Column('report_type', sa.String(length=255), nullable=True))
    op.add_column('reports', sa.Column('form_selections', postgresql.JSON(astext_type=sa.Text()), nullable=True))
    op.add_column('reports', sa.Column('generated_content', sa.Text(), nullable=True))
    op.add_column('reports', sa.Column('prompt_used', sa.Text(), nullable=True))

    # Add generation metadata fields
    op.add_column('reports', sa.Column('llm_provider', sa.String(length=50), nullable=True))
    op.add_column('reports', sa.Column('model_used', sa.String(length=100), nullable=True))
    op.add_column('reports', sa.Column('tokens_used', sa.Integer(), nullable=True))
    op.add_column('reports', sa.Column('generation_time', sa.Float(), nullable=True))
    op.add_column('reports', sa.Column('error_message', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove blueprint-related fields from reports table
    op.drop_column('reports', 'error_message')
    op.drop_column('reports', 'generation_time')
    op.drop_column('reports', 'tokens_used')
    op.drop_column('reports', 'model_used')
    op.drop_column('reports', 'llm_provider')
    op.drop_column('reports', 'prompt_used')
    op.drop_column('reports', 'generated_content')
    op.drop_column('reports', 'form_selections')
    op.drop_column('reports', 'report_type')
    op.drop_column('reports', 'blueprint')
