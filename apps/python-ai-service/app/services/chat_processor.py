import logging
from app.models.schemas import ChatRequest, CreateOrderPayload
from app.services.intent_classifier import intent_classifier
from app.services.rag_service import rag_service
from app.services.order_extractor import order_extractor
from app.services.nextjs_client import nextjs_client

logger = logging.getLogger(__name__)

BOT_SETTINGS_CACHE: dict[str, dict] = {}


class ChatProcessor:
    async def process(self, request: ChatRequest) -> str:
        intent = await intent_classifier.classify(request.message)
        logger.info("merchant=%s intent=%s", request.merchant_id, intent)

        if intent == "greeting":
            return "Hello! How can I help you today? Feel free to ask about our products or place an order."

        if intent == "human":
            return (
                "I'm connecting you to a human agent. Please hold on — "
                "someone will be with you shortly."
            )

        if intent == "question":
            return await self._handle_question(request)

        if intent == "order":
            return await self._handle_order(request)

        return "I'm not sure how to help with that. Could you rephrase?"

    async def _handle_question(self, request: ChatRequest) -> str:
        try:
            answer = await rag_service.answer(request.merchant_id, request.message)
            return answer
        except Exception as e:
            logger.error("RAG error: %s", e)
            return (
                "I couldn't find the answer in our catalog right now. "
                "Please try again or contact us directly."
            )

    async def _handle_order(self, request: ChatRequest) -> str:
        extracted = await order_extractor.extract(request.message)

        if not extracted or not extracted.items:
            return (
                "I'd love to help you place an order! "
                "Could you tell me which products you'd like and the quantity?"
            )

        payload = CreateOrderPayload(
            merchant_id=request.merchant_id,
            customer_id=request.customer_id,
            session_id=request.session_id,
            customer_name=extracted.customer_name,
            phone=extracted.phone,
            address=extracted.address,
            items=extracted.items,
        )

        try:
            order_response = await nextjs_client.create_order(payload)
            order_id = order_response.get("data", {}).get("id", "")[-8:]

            items_summary = ", ".join(
                f"{item.quantity}x {item.name}" for item in extracted.items
            )

            return (
                f"Your order has been placed! Order #{order_id}\n"
                f"Items: {items_summary}\n"
                f"We'll contact you shortly to confirm delivery details."
            )
        except Exception as e:
            logger.error("Order creation failed: %s", e)
            return (
                "I extracted your order but encountered an issue saving it. "
                "Please try again or contact support."
            )


chat_processor = ChatProcessor()
