// Shared type contracts between Next.js and any other consumers

export type MessengerType = "TELEGRAM" | "WHATSAPP";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";
export type ChatSessionStatus = "ACTIVE" | "CLOSED" | "HUMAN_TAKEOVER";

export interface CreateOrderRequest {
  merchantId: string;
  customerId: string;
  sessionId?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CatalogRow {
  category?: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  unit?: string;
}
