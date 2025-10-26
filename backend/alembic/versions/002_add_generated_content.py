"""add generated content table

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.drop_index(op.f('ix_generated_content_id'), table_name='generated_content')
    op.drop_table('generated_content')
    op.execute('DROP TYPE IF EXISTS contenttype')
    op.execute('DROP TYPE IF EXISTS contenttone')
