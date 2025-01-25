import express, { Request, Response } from "express";
import { DeliveryOrderInputSchema } from "./schemas/inputValidation";
import { calculateDeliveryOrderPrice } from "./core/calculator";
import { fetchVenueData } from "./clients/homeAssignment";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/v1/delivery-order-price", (req: Request, res: Response) => {
  const result = DeliveryOrderInputSchema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({
      error: "Invalid input",
      details: result.error.errors,
    });
    return;
  }
  const validatedInput = result.data;

  fetchVenueData(validatedInput.venue_slug)
    .then((venueData) => {
      res.json(calculateDeliveryOrderPrice(validatedInput, venueData));
    })
    .catch((error) => {
      if (error instanceof Error) {
        if (error.message.startsWith("No venue with")) {
          res.status(404).json({
            error: "Not Found",
            message: error.message,
          });
          return;
        }
        if (error.message === "Delivery distance is too long") {
          res.status(400).json({
            error: "Bad Request",
            message: error.message,
          });
          return;
        }
        res.status(500).json({
          error: "Internal Server Error",
          message: "An unexpected error occured",
        });
        return;
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
