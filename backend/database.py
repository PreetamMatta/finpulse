import os
from sqlmodel import Session, create_engine

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/finpulse.db")
if DATABASE_URL.startswith("file:"):
    DATABASE_URL = "sqlite:///" + DATABASE_URL[5:]

_echo = os.getenv("SQL_ECHO", "false").lower() == "true"
engine = create_engine(DATABASE_URL, echo=_echo)


def get_session():
    with Session(engine) as session:
        yield session
