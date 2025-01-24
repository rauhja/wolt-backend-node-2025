import { expect, describe, it } from "vitest";
import {
  calculateDeliveryDistance,
  calculateDeliveryOrderPrice,
  calculateDeliveryFee,
  validateDeliveryRanges,
  calculateSmallOrderSurcharge,
} from "./calculator";
import { DeliveryOrderInput } from "../schemas/inputValidation";
import { DistanceRange, VenueData } from "../types/api";

describe("Delivery Order Price Calculator Service", () => {
  const mockUserLat = 60.17094;
  const mockUserLon = 24.93087;
  const mockVenueLocation: [number, number] = [24.92813512, 60.17012143]; // [lon, lat]
  const mockDistanceRanges: DistanceRange[] = [
    { min: 0, max: 500, a: 0, b: 0, flag: null },
    { min: 500, max: 1000, a: 100, b: 1, flag: null },
    { min: 1000, max: 0, a: 0, b: 0, flag: null },
  ];

  describe("calculateDeliveryDistance", () => {
    it("should calculate distance correctly for given locations", () => {
      const distance = calculateDeliveryDistance(
        mockVenueLocation,
        mockUserLat,
        mockUserLon
      );
      expect(distance).toBe(177);
    });

    it("should return 0 for same location", () => {
      const distance = calculateDeliveryDistance(
        mockVenueLocation,
        mockVenueLocation[1],
        mockVenueLocation[0]
      );
      expect(distance).toBe(0);
    });

    it("should handle negative coordinates", () => {
      const distance = calculateDeliveryDistance(
        [-24.92813512, -60.17012143],
        -60.17094,
        -24.93087
      );
      expect(distance).toBe(177);
    });
  });

  describe("validateDeliveryRanges", () => {
    it("should accept valid ranges", () => {
      expect(() => validateDeliveryRanges(mockDistanceRanges)).not.toThrow();
    });

    it("should throw error for empty ranges", () => {
      expect(() => validateDeliveryRanges([])).toThrow(
        "No distance ranges defined"
      );
    });

    it("should throw error for negative min value", () => {
      const invalidRange = [{ min: -1, max: 500, a: 0, b: 0, flag: null }];
      expect(() => validateDeliveryRanges(invalidRange)).toThrow(
        "Negative values in distance ranges"
      );
    });

    it("should throw error for negative max value", () => {
      const invalidRange = [{ min: 0, max: -500, a: 0, b: 0, flag: null }];
      expect(() => validateDeliveryRanges(invalidRange)).toThrow(
        "Negative values in distance ranges"
      );
    });

    it("should throw error for negative 'a' value", () => {
      const invalidRange = [{ min: 0, max: 500, a: -1, b: 0, flag: null }];
      expect(() => validateDeliveryRanges(invalidRange)).toThrow(
        "Negative values in distance ranges"
      );
    });

    it("should throw error for negative 'b' value", () => {
      const invalidRange = [{ min: 0, max: 500, a: 0, b: -1, flag: null }];
      expect(() => validateDeliveryRanges(invalidRange)).toThrow(
        "Negative values in distance ranges"
      );
    });
  });

  describe("calculateDeliveryFee", () => {
    const basePrice = 190;

    it("should calculate fee correctly for distance within first range", () => {
      const fee = calculateDeliveryFee(400, basePrice, mockDistanceRanges);
      // 190 + 0 + 0 * 400/10
      expect(fee).toBe(190);
    });

    it("should calculate fee correctly for distance within second range", () => {
      const fee = calculateDeliveryFee(600, basePrice, mockDistanceRanges);
      // 190 + 100 + 1 * 600/10
      expect(fee).toBe(350);
    });

    it("should throw error for distance beyond max range", () => {
      expect(() =>
        calculateDeliveryFee(1000, basePrice, mockDistanceRanges)
      ).toThrow("Delivery distance is too long");
    });

    it("should handle edge case at range boundary", () => {
      const fee = calculateDeliveryFee(500, basePrice, mockDistanceRanges);
      // 190 + 100 + 1 * 500/10
      expect(fee).toBe(340);
    });
  });

  describe("calculateSmallOrderSurcharge", () => {
    const minimumOrder = 1000;
    it("should calculate correct surcharge when below minimum order value", () => {
      expect(calculateSmallOrderSurcharge(800, minimumOrder)).toBe(200);
    });

    it("should return 0 when cart value equals minimum order value", () => {
      expect(calculateSmallOrderSurcharge(1000, minimumOrder)).toBe(0);
    });

    it("should return 0 when cart value is over minimum order value", () => {
      expect(calculateSmallOrderSurcharge(1200, minimumOrder)).toBe(0);
    });

    it("should handle very small cart value", () => {
      expect(calculateSmallOrderSurcharge(1, minimumOrder)).toBe(999);
    });
  });

  describe("calculateDeliveryOrderPrice", () => {
    const mockOrder: DeliveryOrderInput = {
      venue_slug: "test-venue",
      cart_value: 1000,
      user_lat: 60.17094,
      user_lon: 24.93087,
    };

    const mockVenueData: VenueData = {
      venue_location: [24.92813512, 60.17012143], // [lon, lat]
      order_minimum_no_surcharge: 1000,
      base_price: 190,
      distance_ranges: mockDistanceRanges,
    };

    it("should calculate total price correctly for normal order", () => {
      const result = calculateDeliveryOrderPrice(mockOrder, mockVenueData);
      expect(result).toMatchObject({
        total_price: 1190,
        small_order_surcharge: 0,
        cart_value: mockOrder.cart_value,
        delivery: {
          fee: 190,
          distance: 177,
        },
      });
    });

    it("should include small order surcharge in total price", () => {
      const smallOrder = { ...mockOrder, cart_value: 800 };
      const result = calculateDeliveryOrderPrice(smallOrder, mockVenueData);
      expect(result.total_price).toBe(
        result.cart_value + result.small_order_surcharge + result.delivery.fee
      );
    });

    it("should throw error for delivery distance too long", () => {
      const tooLongOrder = { ...mockOrder, user_lat: 61.17551736 };
      expect(() =>
        calculateDeliveryOrderPrice(tooLongOrder, mockVenueData)
      ).toThrow("Delivery distance is too long");
    });
  });
});
