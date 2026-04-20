import type {
  Merchant,
  BotSettings,
  Integration,
  ProductCategory,
  Product,
  Customer,
  ChatSession,
  ChatMessage,
  Order,
  OrderItem,
  MessengerType,
  OrderStatus,
  ChatRole,
  ChatSessionStatus,
} from "@prisma/client";

export type {
  Merchant,
  BotSettings,
  Integration,
  ProductCategory,
  Product,
  Customer,
  ChatSession,
  ChatMessage,
  Order,
  OrderItem,
  MessengerType,
  OrderStatus,
  ChatRole,
  ChatSessionStatus,
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & { product: Product | null })[];
  customer: Customer;
};

export type ChatSessionWithMessages = ChatSession & {
  messages: ChatMessage[];
  customer: Customer;
};

export type ProductWithCategory = Product & {
  category: ProductCategory | null;
};

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
