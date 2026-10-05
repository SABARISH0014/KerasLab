from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
import os

app = FastAPI(title="KerasLab Backend")

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
allow_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    frontend_url
]

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
