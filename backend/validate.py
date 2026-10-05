import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

# Verify the model can load successfully from the saved weights
weights_path = os.path.join(os.path.dirname(__file__), "model", "mnist.weights.h5")

print("Building model architecture...")
model = keras.Sequential([
    keras.Input(shape=(28, 28)),
    layers.Flatten(),
    layers.Dense(128, activation="relu"),
    layers.Dense(10, activation="softmax")
])

print("Loading weights...")
model.load_weights(weights_path)

print("\nModel Summary:")
model.summary()

print("\nLoading test data...")
(_, _), (x_test, y_test) = keras.datasets.mnist.load_data()
x_test = x_test.astype("float32") / 255.0

sample = x_test[:1]
print("Running prediction...")
prediction = model.predict(sample)

print(f"Prediction shape: {prediction.shape}")
assert prediction.shape == (1, 10), "Prediction shape mismatch!"
print("Success! The architecture matches and the weights load properly.")
