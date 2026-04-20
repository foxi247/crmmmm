from fastapi import APIRouter
from app.models.schemas import ChatRequest
from app.services.chat_processor import chat_processor

router = APIRouter(prefix="/chat")


@router.post("/process")
async def process_chat(request: ChatRequest) -> dict:
    reply = await chat_processor.process(request)
    return {"reply": reply, "merchant_id": request.merchant_id}
