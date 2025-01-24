import { describe, it, expect } from "vitest";
import { DeliveryOrderInputSchema } from "./inputValidation";

describe("Delivery Order Input Validation", () => {
  describe("Valid inputs", () => {
    it("should validate correct input format", () => {
      const validInput = {
        venue_slug: "test-venue",
        cart_value: "1000",
        user_lat: "60.17094",
        user_lon: "24.93087",
      };

      const result = DeliveryOrderInputSchema.parse(validInput);
      expect(result).toEqual({
        venue_slug: "test-venue",
        cart_value: 1000,
        user_lat: 60.17094,
        user_lon: 24.93087,
      });
    });

    it("should accept minimum valid coordinates", () => {
      const inputWithMinCoord = {
        venue_slug: "test-venue",
        cart_value: 1000,
        user_lat: -90,
        user_lon: -180,
      };
      const result = DeliveryOrderInputSchema.safeParse(inputWithMinCoord);
      expect(result.success).toBe(true);
    });

    it("should accept maximum valid coordinates", () => {
      const inputWithMaxCoord = {
        venue_slug: "test-venue",
        cart_value: 1000,
        user_lat: 90,
        user_lon: 180,
      };
      const result = DeliveryOrderInputSchema.safeParse(inputWithMaxCoord);
      expect(result.success).toBe(true);
    });
  });

  describe("Invalid inputs", () => {
    it("should reject empty venue slug", () => {
      const emptyVenue = {
        venue_slug: "",
        cart_value: 1000,
        user_lat: 60.17094,
        user_lon: 24.93087,
      };
      const result = DeliveryOrderInputSchema.safeParse(emptyVenue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Venue slug is required"
        );
      }
    });

    // Assuming cart value is always greater than 0.
    it("should reject zero cart value", () => {
      const zeroCartValue = {
        venue_slug: "test-venue",
        cart_value: 0,
        user_lat: 60.17094,
        user_lon: 24.93087,
      };

      const result = DeliveryOrderInputSchema.safeParse(zeroCartValue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Cart value must be positive"
        );
      }
    });

    it("should reject negative cart value", () => {
      const negativeCartValue = {
        venue_slug: "test-venue",
        cart_value: -1000,
        user_lat: 60.17094,
        user_lon: 24.93087,
      };
      const result = DeliveryOrderInputSchema.safeParse(negativeCartValue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Cart value must be positive"
        );
      }
    });

    it("should reject non-integer cart value", () => {
      const floatCartValue = {
        venue_slug: "test-venue",
        cart_value: 1000.5,
        user_lat: 60.17094,
        user_lon: 24.93087,
      };
      const result = DeliveryOrderInputSchema.safeParse(floatCartValue);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Cart value must be an integer"
        );
      }
    });

    it("should reject latitude out of range", () => {
      const latOutOfRange = {
        venue_slug: "test-venue",
        cart_value: 1000,
        user_lat: 90.1,
        user_lon: 24.93087,
      };
      const result = DeliveryOrderInputSchema.safeParse(latOutOfRange);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Latitude must be between -90 and 90"
        );
      }
    });

    it("should reject latitude out of range", () => {
      const lonOutOfRange = {
        venue_slug: "test-venue",
        cart_value: 1000,
        user_lat: 60.17094,
        user_lon: 180.1,
      };
      const result = DeliveryOrderInputSchema.safeParse(lonOutOfRange);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Longitude must be between -180 and 180"
        );
      }
    });

    it("should reject invalid value types", () => {
      const invalidTypes = {
        venue_slug: 123,
        cart_value: "1000",
        user_lat: "60.17094",
        user_lon: "24.93087",
      };
      const result = DeliveryOrderInputSchema.safeParse(invalidTypes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should reject missing fields", () => {
      const missingValues = {
        venue_slug: "test-venue",
        cart_value: 1000,
      };
      const result = DeliveryOrderInputSchema.safeParse(missingValues);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });
});
