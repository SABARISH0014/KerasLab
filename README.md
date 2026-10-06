# KerasLab

**Learn Deep Learning by Experimenting**

KerasLab is an interactive educational sandbox for absolute beginners to understand and experiment with Deep Learning using Keras. It visualizes the core concepts of Neural Networks by working with the famous MNIST handwritten digit dataset.

## 1. Overview
The primary goal of KerasLab is to teach beginners the practical flow of a deep learning project:
`Deep Learning → Keras → Neural Networks → Data Preparation → Build Neural Network → Compile → Train → Evaluate → MNIST → Handwritten Digit Prediction`

## 2. Features
- **Educational Explanations:** Simple breakdowns of complex terms (e.g., ReLU, Softmax, Dense layers).
- **Neural Network Explorer:** Interactive visualization of a 784 → 128 → 10 model architecture.
- **MNIST Explorer:** Visual insight into the training data.
- **Model Builder:** A sandbox to tweak hidden neurons, activation functions, and epochs, generating actual Keras code dynamically.
- **Training Dashboard:** Real-time graphs for accuracy and loss during training.
- **Prediction Canvas:** Draw a digit and let the deployed model predict it with live probability scores.

## 3. Architecture
```text
                    KERASLAB
                       |
             +---------+---------+
             |                   |
        FRONTEND              BACKEND
             |                   |
          Next.js             FastAPI
          React               Python
          TypeScript          TensorFlow
          Tailwind            Keras
             |                   |
             |                MNIST
             |                   |
             +---------+---------+
                       |
                  JSON / REST API
```

## 4. Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts, Lucide React
- **Backend:** Python 3, FastAPI, Uvicorn, TensorFlow, Keras, Pillow

## 5. Project Structure
- `frontend/` - Next.js UI
- `backend/` - FastAPI server and trained model
- `ml/` - Training scripts and notebooks for Google Colab/local training

## 6. Keras Model
The default model architecture:
- Input: Flatten (784 features, from 28x28 grayscale image)
- Hidden: Dense (128 neurons, ReLU activation)
- Output: Dense (10 neurons, Softmax activation)

## 7. API Endpoints
- `GET /health` - Health check
- `GET /model/info` - Current model architecture config
- `POST /predict` - Accepts image form data, returns prediction & probabilities
- `POST /train` - Trains model dynamically based on provided config
- `POST /evaluate` - Evaluates current model on MNIST test data

## 8. Local Setup
1. **Backend:**
   - cd `backend/`
   - `python -m venv venv`
   - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
   - `pip install -r requirements.txt`
   - Run model training script: `python ../ml/train_mnist.py`
   - Start server: `uvicorn app.main:app --reload`
2. **Frontend:**
   - cd `frontend/`
   - `npm install`
   - `npm run dev`

## 9. Google Colab Training
A Jupyter notebook is provided in `ml/mnist_training.ipynb` for cloud-based training iterations. You can export the `.keras` model from Colab and drop it into `backend/model/`.

## 10. Docker
The backend includes a `Dockerfile` for containerization.
- Build: `docker build -t keraslab-backend .`
- Run: `docker run -p 8000:8000 keraslab-backend`

## 11. Deployment
- **Frontend:** Next.js / Vercel
- **Backend:** FastAPI / AWS EC2 (Ubuntu + Nginx + systemd)
- **ML:** TensorFlow / Keras (AWS-hosted Keras backend)
## 12. How the Prediction Works
1. You draw a digit on the HTML5 canvas.
2. The image is sent to FastAPI.
3. Pillow converts it to grayscale, resizes to 28x28, and normalizes pixel values (0-1).
4. The Keras model processes the 784-length vector.
5. Softmax returns an array of 10 probabilities.
6. Next.js visualizes the highest probability as the prediction.

## 13. Screenshots
*(Add screenshots here)*

## 14. Future Improvements
- CNN visualization
- More datasets (Fashion MNIST, CIFAR-10)
- Multiple model architectures
- Overfitting demonstrations
- Experiment history
- Explainable AI & Confusion matrix exploration
