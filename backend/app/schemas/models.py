from pydantic import BaseModel, Field
from typing import List, Optional

class ModelConfig(BaseModel):
    hidden_units: int = Field(default=128, ge=32, le=256)
    activation: str = Field(default="relu")
    epochs: int = Field(default=5, ge=1, le=10)

class TrainRequest(BaseModel):
    config: ModelConfig

class TrainResponse(BaseModel):
    success: bool
    history: dict
    test_accuracy: float
    test_loss: float

class PredictResponse(BaseModel):
    prediction: int
    confidence: float
    probabilities: List[float]

class EvaluateResponse(BaseModel):
    test_accuracy: float
    test_loss: float
