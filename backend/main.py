import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.transcription import router as transcription_router

app = FastAPI(
    title="Voice Converter API",
    description="Backend service supporting TTS/STT and audio processing fallback",
    version="1.0.0"
)

# Configure CORS so Vite dev server can seamlessly interact
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription_router)

@app.get("/")
def root():
    return {
        "message": "Voice Converter API is running",
        "documentation": "/docs",
        "status_url": "/api/status"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
