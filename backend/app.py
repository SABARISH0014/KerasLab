import gradio as gr
from app.main import app as fastapi_app

# Hugging Face Gradio Spaces require a Gradio interface.
# We create a simple dummy interface, and then mount our actual FastAPI app!
demo = gr.Blocks()

with demo:
    gr.Markdown("# KerasLab API is Running!")
    gr.Markdown("This is a headless FastAPI server running on a free Gradio Space.")

# Mount the Gradio app on a sub-path, leaving the root (/) and our API endpoints 
# intact for the Next.js frontend to communicate with.
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio_ui")
