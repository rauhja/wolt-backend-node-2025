import axios, { AxiosError } from "axios";
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
}

export async function fetchStaticData(
  venue_slug: string
): Promise<StaticVenueResponse> {
  try {
    const url = API_ENDPOINTS.STATIC.replace("{venue_slug}", venue_slug);
    const response = await client.get<StaticVenueResponse>(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchDynamicData(
  venue_slug: string
): Promise<DynamicVenueResponse> {
  try {
    const url = API_ENDPOINTS.DYNAMIC.replace("{venue_slug}", venue_slug);
    const response = await client.get<DynamicVenueResponse>(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    throw new Error(axiosError.message);
  }
  throw new Error("An unexpected error occured");
}
