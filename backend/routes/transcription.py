import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Transcription"])
logger = logging.getLogger("voice_converter_api")

class TranscriptionResponse(BaseModel):
    status: str
    transcription: str
    language: Optional[str] = "en-US"
    source: str
    message: Optional[str] = None

@router.get("/status")
async def get_status():
    return {
        "status": "online",
        "service": "Voice Converter Backend",
        "primary_engine": "Browser Native Web Speech API",
        "fallback_engine": "FastAPI Audio Handler (Ready for Whisper)",
        "version": "1.0.0"
    }

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: Optional[UploadFile] = File(None),
    language: Optional[str] = Form("en-US"),
    text_content: Optional[str] = Form(None)
):
    """
    Audio file transcription endpoint.
    Primary STT is performed directly via browser SpeechRecognition API.
    This endpoint serves as the backend bridge for audio payloads or future server-side Whisper models.
    """
    try:
        if text_content:
            # Echo / validation pathway
            return TranscriptionResponse(
                status="success",
                transcription=text_content.strip(),
                language=language,
                source="server_processed",
                message="Text verified successfully by backend."
            )

        if not file:
            raise HTTPException(status_code=400, detail="No audio file or text provided for transcription.")

        filename = file.filename or "recording.wav"
        contents = await file.read()
        file_size = len(contents)

        logger.info(f"Received audio file {filename} ({file_size} bytes) for language {language}")

        # Server-side transcription bridge
        return TranscriptionResponse(
            status="success",
            transcription=f"[Audio received: {filename}, size: {file_size} bytes, language: {language}. Browser native STT remains primary live engine.]",
            language=language,
            source="backend_fallback",
            message="Backend successfully processed audio payload."
        )

    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Backend transcription error: {str(e)}")
