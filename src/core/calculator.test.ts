import { expect, describe, it } from "vitest";
import { calculateDeliveryOrderPrice } from "./calculator";
import { DeliveryOrderInput } from "../schemas/inputValidation";
import { VenueData } from "../types/api";

describe("Delivery Order Price Calculator Service", () => {
  const mockVenueSlug = "test-venue";
  const mockUserLat = 60.17094;
  const mockUserLon = 24.93087;
  const mockCartValue = 1000;

  const mockOrder: DeliveryOrderInput = {
    venue_slug: mockVenueSlug,
    cart_value: mockCartValue,
    user_lat: mockUserLat,
    user_lon: mockUserLon,
  };

  const mockVenueData: VenueData = {
    venue_location: [24.92813512, 60.17012143], // [lon, lat]
    order_minimum_no_surcharge: 1000,
    base_price: 190,
    distance_ranges: [
      {
        min: 0,
        max: 500,
        a: 0,
        b: 0,
        flag: null,
      },
      {
        min: 500,
        max: 1000,
        a: 100,
        b: 1,
        flag: null,
      },
      {
        min: 1000,
        max: 0,
        a: 0,
        b: 0,
        flag: null,
      },
    ],
  };

  describe("Successful price calculations", () => {
    it("should calculate price correctly for a normal order", () => {
      const result = calculateDeliveryOrderPrice(mockOrder, mockVenueData);
      expect(result).toMatchObject({
        total_price: 1190,
        small_order_surcharge: 0,
        cart_value: mockCartValue,
        delivery: {
          fee: 190,
          distance: 177,
        },
      });
    });

    it("should calculate small order surcharge when cart value is below minimum", () => {
      const smallOrder = { ...mockOrder, cart_value: 800 };
      const result = calculateDeliveryOrderPrice(smallOrder, mockVenueData);

      expect(result.small_order_surcharge).toBe(200);
      expect(result.total_price).toBe(
        result.cart_value + result.small_order_surcharge + result.delivery.fee
      );
    });
  });

  describe("Distance calculation", () => {
    it("should calculate delivery fee based on distance ranges", () => {
      const userSixHundredMetersAway = {
        ...mockOrder,
        user_lat: 60.17551736, // Exact 600m to north from venue
        user_lon: 24.92813512,
      };
      const result = calculateDeliveryOrderPrice(
        userSixHundredMetersAway,
        mockVenueData
      );

      // For 600m distance: 190 + 100 + 1 * 600/10
      expect(result.delivery.fee).toBe(350);
    });

    it("should throw error when delivery is too long", () => {
      const userTooFarAway = {
        ...mockOrder,
        user_lat: 61.17551736,
      };

      expect(() =>
        calculateDeliveryOrderPrice(userTooFarAway, mockVenueData)
      ).toThrow("Delivery distance is too long");
    });
  });

  describe("Edge cases", () => {
    it("should handle zero cart value", () => {
      const zeroCart = { ...mockOrder, cart_value: 0 };
      const result = calculateDeliveryOrderPrice(zeroCart, mockVenueData);

      expect(result.small_order_surcharge).toBe(1000);
      expect(result.total_price).toBe(result.delivery.fee + 1000);
    });

    it("should handle exact minimum cart value", () => {
      const minimumCart = { ...mockOrder, cart_value: 1000 };
      const result = calculateDeliveryOrderPrice(minimumCart, mockVenueData);

      expect(result.small_order_surcharge).toBe(0);
    });

    it("should handle exact distance range boundary", () => {
      const userFiveHundredMetersAway = {
        ...mockOrder,
        user_lat: 60.17461804, // Exact 500m to north from venue
        user_lon: 24.92813512,
      };
      const result = calculateDeliveryOrderPrice(
        userFiveHundredMetersAway,
        mockVenueData
      );

      // For 500m distance: 190 + 100 + 1 * 500/10
      expect(result.delivery.fee).toBe(340);
    });
  });
});
