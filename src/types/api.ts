export interface StaticVenueResponse {
  venue_raw: {
    location: {
      coordinates: [number, number];
    };
  };
}

export interface DynamicVenueResponse {
  venue_raw: {
    delivery_specs: {
      order_minimum_no_surcharge: number;
      delivery_pricing: {
        base_price: number;
        distance_ranges: DistanceRange[];
      };
    };
  };
}

export interface DistanceRange {
  min: number;
  max: number;
  a: number;
  b: number;
  flag: null;
}

export interface DeliveryOrderPriceResponse {
  total_price: number;
  small_order_surcharge: number;
  cart_value: number;
  delivery: {
    fee: number;
    distance: number;
  };
}

export interface VenueData {
  venue_location: [number, number];
  order_minimum_no_surcharge: number;
  base_price: number;
  distance_ranges: DistanceRange[];
}
