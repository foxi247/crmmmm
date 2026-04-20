from pydantic import BaseModel
from typing import Any


class TelegramUpdate(BaseModel):
    update_id: int
    message: dict[str, Any] | None = None
    callback_query: dict[str, Any] | None = None
    merchant_id: str


class WhatsAppUpdate(BaseModel):
    object: str
    entry: list[dict[str, Any]]
    merchant_id: str


class ChatRequest(BaseModel):
    merchant_id: str
    customer_id: str
    session_id: str | None = None
    message: str
    messenger_type: str = "TELEGRAM"


class OrderItem(BaseModel):
    product_id: str | None = None
    name: str
    price: float
    quantity: int


class ExtractedOrder(BaseModel):
    items: list[OrderItem]
    customer_name: str | None = None
    phone: str | None = None
    address: str | None = None


class CreateOrderPayload(BaseModel):
    merchant_id: str
    customer_id: str
    session_id: str | None = None
    customer_name: str | None = None
    phone: str | None = None
    address: str | None = None
    items: list[OrderItem]


class CatalogRow(BaseModel):
    category: str | None = None
    name: str
    price: float
    description: str | None = None
    stock: int = 0
    unit: str | None = None


class CatalogParseResult(BaseModel):
    merchant_id: str
    rows: list[CatalogRow]
    total: int
    errors: list[str]
