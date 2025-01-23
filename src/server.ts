import express, { Request, Response } from "express";
import { DeliveryOrderInputSchema } from "./schemas/inputValidation";
import { calculateDeliveryOrderPrice } from "./core/calculator";
import { fetchVenueData } from "./clients/homeAssignment";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/v1/delivery-order-price", (req: Request, res: Response) => {
  const result = DeliveryOrderInputSchema.safeParse({
    venue_slug: req.query.venue_slug,
    cart_value: parseInt(req.query.cart_value as string),
    user_lat: parseFloat(req.query.user_lat as string),
    user_lon: parseFloat(req.query.user_lon as string),
  });

  if (!result.success) {
    res.status(400).json({
      error: "Invalid input",
      details: result.error.errors,
    });
    return;
  }

  fetchVenueData(result.data.venue_slug)
    .then((venueData) => {
      res.json(calculateDeliveryOrderPrice(result.data, venueData));
    })
    .catch((error) => {
      if (
        error instanceof Error &&
        error.message === "Delivery distance is too long"
      ) {
        res.status(400).json({ error: "Bad Request", message: error.message });
      }
      res.status(500).json({
        error: "Internal Server Error",
        message: "An unexpected error occured",
      });
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
