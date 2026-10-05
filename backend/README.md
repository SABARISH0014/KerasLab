# KerasLab Backend API

This repository contains the FastAPI backend for KerasLab.
It serves the MNIST digit recognition model via standard REST endpoints.

## Running Locally

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
