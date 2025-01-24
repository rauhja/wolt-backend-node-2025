import { z } from "zod";

export const DeliveryOrderInputSchema = z.object({
  venue_slug: z
    .string()
    .min(1, "Venue slug is required")
    .max(200, "Venue slug length must be shorter than 200 char"),
  cart_value: z.coerce
    .number()
    .int("Cart value must be an integer")
    .positive("Cart value must be positive"), // Assuming cart value is always greater than 0.
  user_lat: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  user_lon: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export type DeliveryOrderInput = z.infer<typeof DeliveryOrderInputSchema>;
