import json
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from app.core.config import settings
from app.models.schemas import ExtractedOrder, OrderItem

EXTRACT_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an order extraction assistant. Extract order details from the customer message.
Return a JSON object with this exact structure:
{{
  "items": [
    {{"name": "product name", "quantity": 1, "price": 0.0}}
  ],
  "customer_name": "name or null",
  "phone": "phone or null",
  "address": "address or null"
}}

Rules:
- quantity must be a positive integer
- price should be 0.0 if unknown
- customer_name/phone/address are null if not provided
- items must be a non-empty list
Return ONLY the JSON, no markdown.""",
    ),
    ("human", "Customer message: {message}"),
])


class OrderExtractor:
    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            api_key=settings.openai_api_key,
        )
        self._chain = EXTRACT_PROMPT | self._llm

    async def extract(self, message: str) -> ExtractedOrder | None:
        try:
            result = await self._chain.ainvoke({"message": message})
            raw = json.loads(result.content.strip())
            items = [OrderItem(**item) for item in raw.get("items", [])]
            if not items:
                return None
            return ExtractedOrder(
                items=items,
                customer_name=raw.get("customer_name"),
                phone=raw.get("phone"),
                address=raw.get("address"),
            )
        except (json.JSONDecodeError, Exception):
            return None


order_extractor = OrderExtractor()
