import { getStaticData, getDynamicData } from "../clients/homeAssignment";
import {
  DeliveryOrderPriceResponse,
  VenueData,
  DistanceRange,
} from "../types/api";
import { DeliveryOrderInput } from "../schemas/inputValidation";
import { EARTH_RADIUS } from "../config/constants";

async function getVenueData(venue_slug: string): Promise<VenueData> {
  const [staticData, dynamicData] = await Promise.all([
    getStaticData(venue_slug),
    getDynamicData(venue_slug),
  ]);

  return {
    venue_location: staticData.venue_raw.location.coordinates,
    order_minimum_no_surcharge:
      dynamicData.venue_raw.delivery_specs.order_minimum_no_surcharge,
    base_price:
      dynamicData.venue_raw.delivery_specs.delivery_pricing.base_price,
    distance_ranges:
      dynamicData.venue_raw.delivery_specs.delivery_pricing.distance_ranges,
  };
}

function calculateDeliveryDistance(
  venue_location: [number, number],
  user_lat: number,
  user_lon: number
): number {
  const [venue_lon, venue_lat] = venue_location;
  const toRads = (degrees: number): number => (degrees * Math.PI) / 180;

  // https://andrew.hedges.name/experiments/haversine/
  // radius of the Earth in meters

  const lat_diff = toRads(venue_lat - user_lat);
  const lon_diff = toRads(venue_lon - user_lon);

  const a =
    Math.sin(lat_diff / 2) ** 2 +
    Math.cos(toRads(user_lat)) *
      Math.cos(toRads(venue_lat)) *
      Math.sin(lon_diff / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(c * EARTH_RADIUS);
}

function calculateDeliveryFee(
  distance: number,
  base_price: number,
  distance_ranges: DistanceRange[]
): number {
  for (const range of distance_ranges) {
    if (range.max === 0 && distance >= range.min) {
      throw new Error("Delivery distance is too long");
    }
    if (distance >= range.min && distance <= range.max) {
      const { a, b } = range;
      return base_price + a + Math.round((b * distance) / 10);
    }
  }
  throw new Error("Unable to calculate delivery fee");
}

function calculateSmallOrderSurcharge(
  cart_value: number,
  order_minimum_no_surcharge: number
): number {
  return Math.max(order_minimum_no_surcharge - cart_value, 0);
}

export async function calculateDeliveryOrderPrice(
  order: DeliveryOrderInput
): Promise<DeliveryOrderPriceResponse> {
  try {
    const venueData = await getVenueData(order.venue_slug);

    const deliveryDistance = calculateDeliveryDistance(
      venueData.venue_location,
      order.user_lat,
      order.user_lon
    );

    const deliveryFee = calculateDeliveryFee(
      deliveryDistance,
      venueData.base_price,
      venueData.distance_ranges
    );

    const smallOrderSurcharge = calculateSmallOrderSurcharge(
      order.cart_value,
      venueData.order_minimum_no_surcharge
    );

    return {
      total_price: deliveryFee + smallOrderSurcharge + order.cart_value,
      small_order_surcharge: smallOrderSurcharge,
      cart_value: order.cart_value,
      delivery: {
        fee: deliveryFee,
        distance: deliveryDistance,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occured");
  }
}
