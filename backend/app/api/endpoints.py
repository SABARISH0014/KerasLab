from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.models import ModelConfig, PredictResponse, TrainRequest, TrainResponse, EvaluateResponse
from app.ml.keras_model import KerasModelManager
from typing import Dict, Any

router = APIRouter()
model_manager = KerasModelManager()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": model_manager.model is not None
    }

@router.get("/model/info")
async def get_model_info():
    info = model_manager.get_info()
    if not info:
        raise HTTPException(status_code=404, detail="Model not loaded or found")
    return info

@router.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    try:
        result = model_manager.predict(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/train", response_model=TrainResponse)
async def train(request: TrainRequest):
    try:
        result = model_manager.train(request.config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate():
    try:
        result = model_manager.evaluate()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
