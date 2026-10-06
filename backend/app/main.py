from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
import os

app = FastAPI(title="KerasLab Backend")

cors_origins_str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
allow_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

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
