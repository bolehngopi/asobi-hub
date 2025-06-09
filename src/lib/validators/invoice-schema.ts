// inoice schema
import { z } from 'zod';

export const CheckoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid('Invalid item ID format'),
    })
  ).min(1, 'At least one item is required'),
});