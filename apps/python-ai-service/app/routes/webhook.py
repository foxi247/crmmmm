import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import TelegramUpdate, WhatsAppUpdate, ChatRequest
from app.services.chat_processor import chat_processor
from app.services.nextjs_client import nextjs_client

router = APIRouter(prefix="/webhook")
logger = logging.getLogger(__name__)


@router.post("/telegram")
async def telegram_webhook(update: TelegramUpdate):
    message = update.message
    if not message:
        return {"ok": True}

    text: str = message.get("text", "")
    if not text:
        return {"ok": True}

    from_user: dict = message.get("from", {})
    external_id = str(from_user.get("id", ""))
    first_name = from_user.get("first_name")
    username = from_user.get("username")

    if not external_id:
        return {"ok": True}

    try:
        customer_resp = await nextjs_client.upsert_customer(
            merchant_id=update.merchant_id,
            external_id=external_id,
            messenger_type="TELEGRAM",
            name=first_name,
            username=username,
        )
        customer_id = customer_resp["data"]["id"]
        session_id = customer_resp["data"].get("activeSessionId")
    except Exception as e:
        logger.error("Customer upsert failed: %s", e)
        raise HTTPException(status_code=502, detail="CRM service unavailable")

    chat_req = ChatRequest(
        merchant_id=update.merchant_id,
        customer_id=customer_id,
        session_id=session_id,
        message=text,
        messenger_type="TELEGRAM",
    )

    reply = await chat_processor.process(chat_req)

    if session_id:
        try:
            await nextjs_client.save_message(session_id, "USER", text)
            await nextjs_client.save_message(session_id, "ASSISTANT", reply)
        except Exception as e:
            logger.warning("Failed to persist messages: %s", e)

    return {"ok": True, "reply": reply}


@router.post("/whatsapp")
async def whatsapp_webhook(update: WhatsAppUpdate):
    for entry in update.entry:
        for change in entry.get("changes", []):
            value = change.get("value", {})
            messages = value.get("messages", [])
            for msg in messages:
                if msg.get("type") != "text":
                    continue

                external_id = msg.get("from", "")
                text = msg.get("text", {}).get("body", "")

                if not external_id or not text:
                    continue

                try:
                    customer_resp = await nextjs_client.upsert_customer(
                        merchant_id=update.merchant_id,
                        external_id=external_id,
                        messenger_type="WHATSAPP",
                    )
                    customer_id = customer_resp["data"]["id"]
                    session_id = customer_resp["data"].get("activeSessionId")
                except Exception as e:
                    logger.error("Customer upsert failed: %s", e)
                    continue

                chat_req = ChatRequest(
                    merchant_id=update.merchant_id,
                    customer_id=customer_id,
                    session_id=session_id,
                    message=text,
                    messenger_type="WHATSAPP",
                )
                await chat_processor.process(chat_req)

    return {"status": "ok"}
