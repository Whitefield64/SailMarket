"""drop_generated_content

Revision ID: 004
Revises: 003
Create Date: 2025-10-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the generated_content table (old system no longer needed)
    op.drop_table('generated_content')


def downgrade() -> None:
    # Recreate the generated_content table if we need to rollback
    op.create_table(
        'generated_content',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('content_type', sa.Enum('BLOG', 'SOCIAL', 'EMAIL', 'AD_COPY', 'LANDING_PAGE', name='contenttype'), nullable=False),
        sa.Column('topic', sa.String(length=500), nullable=False),
        sa.Column('tone', sa.Enum('PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'HUMOROUS', 'URGENT', name='contenttone'), nullable=False),
        sa.Column('length', sa.Integer(), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('generated_text', sa.Text(), nullable=False),
        sa.Column('llm_provider', sa.String(length=50), nullable=False),
        sa.Column('model_used', sa.String(length=100), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('generation_time', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_generated_content_id'), 'generated_content', ['id'], unique=False)
