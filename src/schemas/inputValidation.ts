import { z } from "zod";

// Input validation schema for the delivery order
export const DeliveryOrderInputSchema = z.object({
  venue_slug: z.string().min(1, "Venue slug is required"),
  cart_value: z.number().positive("Cart value must be positive"),
  user_lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  user_lon: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
});

export type DeliveryOrderInput = z.infer<typeof DeliveryOrderInputSchema>;
