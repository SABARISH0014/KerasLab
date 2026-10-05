import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

def train_and_save_model():
    print("Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
    
    # Normalize pixel values
    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0
    
    print("Building model...")
    model = keras.Sequential([
        keras.Input(shape=(28, 28)),
        layers.Flatten(),
        layers.Dense(128, activation="relu"),
        layers.Dense(10, activation="softmax")
    ])
    
    model.summary()
    
    print("Compiling model...")
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    print("Training model...")
    model.fit(
        x_train,
        y_train,
        epochs=5,
        validation_data=(x_test, y_test)
    )
    
    print("Evaluating model...")
    test_loss, test_acc = model.evaluate(x_test, y_test)
    print(f"Test accuracy: {test_acc:.4f}")
    
    save_path = os.path.join(os.path.dirname(__file__), "..", "backend", "model", "mnist.weights.h5")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    print(f"Saving model to {save_path}...")
    model.save_weights(save_path)
    print("Model saved successfully!")

if __name__ == "__main__":
    train_and_save_model()
