import logging
from datetime import datetime
from typing import Dict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import colorlog

from app.database import engine, Base
from app.routes import router
from app.config import settings

handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(levelname)s:%(reset)s %(message)s',
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'red,bg_white',
    }
))

logger = logging.getLogger()
logger.setLevel(logging.INFO)
logger.addHandler(handler)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marketing AI Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    timestamp = datetime.now().isoformat()
    logger.info(f"{request.method} {request.url.path} - {timestamp}")
    response = await call_next(request)
    return response

app.include_router(router, prefix="/api")

@app.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Marketing AI Agent API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
