import os
import cv2
import numpy as np

# Create a mock image with 10 digits
img = np.ones((100, 800), dtype=np.uint8) * 255

# Draw 10 "digits" (just some rectangles to simulate digits for contour finding)
for i in range(10):
    x_start = i * 80 + 10
    cv2.rectangle(img, (x_start, 20), (x_start + 40, 80), 0, -1)

# Save test image
cv2.imwrite("test_10_digits.png", img)

from app.ml.keras_model import KerasModelManager

manager = KerasModelManager()
with open("test_10_digits.png", "rb") as f:
    image_bytes = f.read()

try:
    result = manager.predict(image_bytes)
    print("Prediction result:", result)
except Exception as e:
    print("Error:", e)
