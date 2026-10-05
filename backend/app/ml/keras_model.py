import os
import io
import numpy as np
from PIL import Image
from app.schemas.models import ModelConfig
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

class KerasModelManager:
    def __init__(self):
        self.model = None
        self.config = ModelConfig()
        self.weights_path = os.path.join(os.path.dirname(__file__), "..", "..", "model", "mnist.weights.h5")
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(self.weights_path):
                self.model = keras.Sequential([
                    keras.Input(shape=(28, 28)),
                    layers.Flatten(),
                    layers.Dense(self.config.hidden_units, activation=self.config.activation),
                    layers.Dense(10, activation="softmax")
                ])
                self.model.load_weights(self.weights_path)
                print(f"Model weights loaded from {self.weights_path}")
        except Exception as e:
            print(f"Failed to load model: {e}")

    def get_info(self):
        if not self.model:
            return None
        
        # In a real app we might parse the model architecture, but for MVP:
        return {
            "input_shape": [784],
            "hidden_units": self.config.hidden_units,
            "output_units": 10,
            "activation": self.config.activation,
            "output_activation": "softmax",
            "optimizer": "adam",
            "loss": "sparse_categorical_crossentropy"
        }

    def predict(self, image_bytes: bytes):
        if not self.model:
            raise ValueError("Model not loaded")

        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to grayscale
        image = image.convert("L")
        
        # Resize to 28x28 with anti-aliasing
        image = image.resize((28, 28), Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Normalize (0-255 -> 0.0-1.0)
        img_array = img_array.astype("float32") / 255.0
        
        # Center of mass normalization (MNIST standard)
        total_mass = np.sum(img_array)
        if total_mass > 0:
            y_coords, x_coords = np.indices(img_array.shape)
            cy = np.sum(y_coords * img_array) / total_mass
            cx = np.sum(x_coords * img_array) / total_mass
            
            shift_y = int(round(13.5 - cy))
            shift_x = int(round(13.5 - cx))
            
            shifted = np.zeros_like(img_array)
            y1_s, y2_s = max(0, -shift_y), min(28, 28 - shift_y)
            y1_d, y2_d = max(0, shift_y), min(28, 28 + shift_y)
            x1_s, x2_s = max(0, -shift_x), min(28, 28 - shift_x)
            x1_d, x2_d = max(0, shift_x), min(28, 28 + shift_x)
            
            shifted[y1_d:y2_d, x1_d:x2_d] = img_array[y1_s:y2_s, x1_s:x2_s]
            img_array = shifted
        
        # Add batch dimension and flatten if needed based on model shape
        # The trained model expects (None, 28, 28) since we have a Flatten layer
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = self.model.predict(img_array)
        probabilities = predictions[0].tolist()
        
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        
        return {
            "prediction": predicted_class,
            "confidence": confidence,
            "probabilities": probabilities
        }

    def train(self, config: ModelConfig):
        print("Loading MNIST dataset...")
        (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
        
        # Normalize pixel values
        x_train = x_train.astype("float32") / 255.0
        x_test = x_test.astype("float32") / 255.0
        
        print("Building model...")
        model = keras.Sequential([
            keras.Input(shape=(28, 28)),
            layers.Flatten(),
            layers.Dense(config.hidden_units, activation=config.activation),
            layers.Dense(10, activation="softmax")
        ])
        
        model.compile(
            optimizer="adam",
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"]
        )
        
        print("Training model...")
        history = model.fit(
            x_train,
            y_train,
            epochs=config.epochs,
            validation_data=(x_test, y_test)
        )
        
        test_loss, test_acc = model.evaluate(x_test, y_test)
        
        os.makedirs(os.path.dirname(self.weights_path), exist_ok=True)
        model.save_weights(self.weights_path)
        
        self.model = model
        self.config = config
        
        return {
            "success": True,
            "history": {
                "accuracy": history.history.get("accuracy", []),
                "loss": history.history.get("loss", []),
                "val_accuracy": history.history.get("val_accuracy", []),
                "val_loss": history.history.get("val_loss", [])
            },
            "test_accuracy": float(test_acc),
            "test_loss": float(test_loss)
        }

    def evaluate(self):
        if not self.model:
            raise ValueError("Model not loaded")
        
        (_, _), (x_test, y_test) = keras.datasets.mnist.load_data()
        x_test = x_test.astype("float32") / 255.0
        
        test_loss, test_acc = self.model.evaluate(x_test, y_test)
        
        return {
            "test_accuracy": float(test_acc),
            "test_loss": float(test_loss)
        }
