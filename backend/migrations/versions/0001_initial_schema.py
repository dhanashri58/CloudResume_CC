"""Initial schema: users, profiles, resumes, experiences, educations, projects, skills

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-10-30 18:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('auth_provider_id', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_auth_provider_id'), 'users', ['auth_provider_id'], unique=True)

    # 2. user_profiles
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),
        sa.Column('headline', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('linkedin', sa.String(length=255), nullable=True),
        sa.Column('github', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_profiles_user_id'), 'user_profiles', ['user_id'], unique=True)

    # 3. resumes
    op.create_table(
        'resumes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, server_default='Untitled Resume'),
        sa.Column('template_id', sa.String(length=50), nullable=False, server_default='executive'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('target_role', sa.String(length=255), nullable=True),
        sa.Column('target_company', sa.String(length=255), nullable=True),
        sa.Column('ats_score', sa.Integer(), nullable=True),
        sa.Column('views', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('full_name', sa.String(length=150), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('linkedin', sa.String(length=255), nullable=True),
        sa.Column('github', sa.String(length=255), nullable=True),
        sa.Column('headline', sa.String(length=255), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resumes_user_id'), 'resumes', ['user_id'], unique=False)

    # 4. experiences
    op.create_table(
        'experiences',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('company', sa.String(length=200), nullable=False),
        sa.Column('role', sa.String(length=200), nullable=False),
        sa.Column('start_date', sa.String(length=50), nullable=True),
        sa.Column('end_date', sa.String(length=50), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('bullets', sa.JSON(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_experiences_resume_id'), 'experiences', ['resume_id'], unique=False)

    # 5. educations
    op.create_table(
        'educations',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('institution', sa.String(length=200), nullable=False),
        sa.Column('degree', sa.String(length=150), nullable=True),
        sa.Column('field_of_study', sa.String(length=150), nullable=True),
        sa.Column('start_date', sa.String(length=50), nullable=True),
        sa.Column('end_date', sa.String(length=50), nullable=True),
        sa.Column('gpa', sa.String(length=20), nullable=True),
        sa.Column('honors', sa.String(length=255), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_educations_resume_id'), 'educations', ['resume_id'], unique=False)

    # 6. projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('technologies', sa.JSON(), nullable=False),
        sa.Column('url', sa.String(length=255), nullable=True),
        sa.Column('github', sa.String(length=255), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_resume_id'), 'projects', ['resume_id'], unique=False)

    # 7. skills
    op.create_table(
        'skills',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('resume_id', sa.String(length=36), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('skills', sa.JSON(), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_resume_id'), 'skills', ['resume_id'], unique=False)


def downgrade():
    op.drop_table('skills')
    op.drop_table('projects')
    op.drop_table('educations')
    op.drop_table('experiences')
    op.drop_table('resumes')
    op.drop_table('user_profiles')
    op.drop_table('users')

