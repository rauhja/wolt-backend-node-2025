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
