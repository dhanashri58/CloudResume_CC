"""Unit tests for Alembic migration execution."""
from pathlib import Path
from alembic import command
from alembic.config import Config as AlembicConfig
from app.extensions import db


def test_alembic_upgrade_downgrade(app):
    """Test that Alembic migrations run upgrade and downgrade cleanly."""
    base_dir = Path(__file__).resolve().parent.parent
    ini_path = base_dir / "migrations" / "alembic.ini"
    script_loc = str(base_dir / "migrations")

    alembic_cfg = AlembicConfig(str(ini_path))
    alembic_cfg.set_main_option("script_location", script_loc)

    with app.app_context():
        # Clean current tables to test migration
        db.drop_all()

        with db.engine.begin() as connection:
            alembic_cfg.attributes['connection'] = connection
            # Upgrade to head
            command.upgrade(alembic_cfg, "head")

            # Check that all tables were created
            inspector = db.inspect(connection)
            tables = inspector.get_table_names()
            assert "users" in tables
            assert "user_profiles" in tables
            assert "resumes" in tables
            assert "experiences" in tables
            assert "educations" in tables
            assert "projects" in tables
            assert "skills" in tables

            # Downgrade back to base
            command.downgrade(alembic_cfg, "base")
            fresh_inspector = db.inspect(connection)
            tables_after = fresh_inspector.get_table_names()
            assert "resumes" not in tables_after
            assert "users" not in tables_after
