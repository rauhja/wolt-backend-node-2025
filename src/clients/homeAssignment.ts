import axios from "axios";
import { API_ENDPOINTS } from "../config/constants";
import { DistanceRange } from "../types/api";

interface StaticVenueResponse {
  venue_raw: {
    location: {
      coordinates: [number, number];
    };
  };
}

interface DynamicVenueResponse {
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

export interface VenueData {
  venue_location: [number, number];
  order_minimum_no_surcharge: number;
  base_price: number;
  distance_ranges: DistanceRange[];
}

const client = axios.create({
  baseURL: process.env.API_BASE_URL,
});

export async function fetchVenueData(venue_slug: string): Promise<VenueData> {
  try {
    const [staticData, dynamicData] = await Promise.all([
      fetchStaticData(venue_slug),
      fetchDynamicData(venue_slug),
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
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`No venue with slug of '${venue_slug}' was found`);
    }
    throw error;
  }
}

export async function fetchStaticData(
  venue_slug: string
): Promise<StaticVenueResponse> {
  const url = API_ENDPOINTS.STATIC.replace("{venue_slug}", venue_slug);
  const response = await client.get<StaticVenueResponse>(url);
  return response.data;
}

export async function fetchDynamicData(
  venue_slug: string
): Promise<DynamicVenueResponse> {
  const url = API_ENDPOINTS.DYNAMIC.replace("{venue_slug}", venue_slug);
  const response = await client.get<DynamicVenueResponse>(url);
  return response.data;
}
