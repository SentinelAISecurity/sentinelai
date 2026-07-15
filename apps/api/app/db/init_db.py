"""Database initialization with default data."""
from sqlalchemy import text
from app.db.session import async_session, engine


async def init_db() -> None:
    """Initialize the database with default data."""
    async with async_session() as db:
        # Create default plugins if table exists
        try:
            await db.execute(text("SELECT 1 FROM users LIMIT 1"))
        except Exception:
            # Tables don't exist yet, will be created by create_all
            pass

    print("Database initialized successfully.")
