import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings
from app.models.schemas import CreateOrderPayload


class NextJsClient:
    def __init__(self) -> None:
        self._base_url = settings.nextjs_api_url
        self._headers = {
            "Content-Type": "application/json",
            "x-api-secret": settings.nextjs_api_secret,
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def create_order(self, payload: CreateOrderPayload) -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{self._base_url}/api/orders",
                json=payload.model_dump(),
                headers=self._headers,
            )
            response.raise_for_status()
            return response.json()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def get_merchant(self, merchant_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{self._base_url}/api/merchants/{merchant_id}",
                headers=self._headers,
            )
            response.raise_for_status()
            return response.json()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def upsert_customer(
        self,
        merchant_id: str,
        external_id: str,
        messenger_type: str,
        name: str | None = None,
        username: str | None = None,
    ) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self._base_url}/api/customers",
                json={
                    "merchantId": merchant_id,
                    "externalId": external_id,
                    "messengerType": messenger_type,
                    "name": name,
                    "username": username,
                },
                headers=self._headers,
            )
            response.raise_for_status()
            return response.json()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def save_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self._base_url}/api/chat/messages",
                json={"sessionId": session_id, "role": role, "content": content},
                headers=self._headers,
            )
            response.raise_for_status()
            return response.json()


nextjs_client = NextJsClient()
