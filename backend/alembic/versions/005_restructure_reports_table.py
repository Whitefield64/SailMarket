"""restructure_reports_table

Revision ID: 005
Revises: 004
Create Date: 2025-10-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop the existing reports table and recreate with proper structure
    # Since no important data exists, this is the cleanest approach
    op.drop_table('reports')

    # Note: The reportstatus enum already exists from previous migrations, so we reuse it
    # Create reports table with proper column order and without config column
    op.create_table(
        'reports',
        # Core identification
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),

        # Report metadata
        sa.Column('report_type', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('status', postgresql.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='reportstatus', create_type=False), nullable=False, server_default='PENDING'),

        # Generation metadata
        sa.Column('llm_provider', sa.String(length=50), nullable=True),
        sa.Column('model_used', sa.String(length=100), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('generation_time', sa.Float(), nullable=True),

        # Report content and structure
        sa.Column('form_selections', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('blueprint', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('prompt_used', sa.Text(), nullable=True),
        sa.Column('generated_content', sa.Text(), nullable=True),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),

        # Error handling
        sa.Column('error_message', sa.Text(), nullable=True),

        # Constraints
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)


def downgrade() -> None:
    # Drop the new table
    op.drop_index(op.f('ix_reports_id'), table_name='reports')
    op.drop_table('reports')

    # Recreate the old table structure (with config column)
    op.create_table(
        'reports',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('config', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('status', postgresql.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='reportstatus', create_type=False), nullable=False, server_default='PENDING'),
        sa.Column('blueprint', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('report_type', sa.String(length=255), nullable=True),
        sa.Column('form_selections', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('generated_content', sa.Text(), nullable=True),
        sa.Column('prompt_used', sa.Text(), nullable=True),
        sa.Column('llm_provider', sa.String(length=50), nullable=True),
        sa.Column('model_used', sa.String(length=100), nullable=True),
        sa.Column('tokens_used', sa.Integer(), nullable=True),
        sa.Column('generation_time', sa.Float(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reports_id'), 'reports', ['id'], unique=False)
