from sqlmodel import Session, create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/finpulse.db")
if DATABASE_URL.startswith("file:"):
    DATABASE_URL = "sqlite:///" + DATABASE_URL[5:]

engine = create_engine(DATABASE_URL, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
