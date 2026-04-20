import { z } from "zod";

export const createOrderSchema = z.object({
  merchantId: z.string().cuid(),
  customerId: z.string().cuid(),
  sessionId: z.string().cuid().optional(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid().optional(),
        name: z.string().min(1),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
