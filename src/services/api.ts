export interface AddressResult {
  address: string;
  postal_code: string;
  lat: string;
  lon: string;
  // API might return more fields, but these are what we need based on requirements
}

export interface Expedition {
  id: number;
  name: string;
  // Adjust based on actual API response if needed, assuming simple list for now
}

export interface ShippingPlan {
  name: string;
  service: string;
  description: string;
  etd: string;
  cost: number;
}

export interface ShippingCostResponse {
  success: boolean;
  results: ShippingPlan[];
  error?: string;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const EXPEDITION_API_URL = process.env.NEXT_PUBLIC_EXPEDITION_API_URL;

export const api = {
  /**
   * Search for an address using Geoapify Geocoding API (Indonesia only).
   * @param query The search string
   */
  searchAddress: async (query: string): Promise<AddressResult[]> => {
    if (!query || query.length < 3) return [];
    if (!GEOAPIFY_API_KEY) {
      console.error("NEXT_PUBLIC_GEOAPIFY_API_KEY is not defined");
      return [];
    }

    try {
      const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      url.searchParams.set("text", query);
      url.searchParams.set("filter", "countrycode:id");
      url.searchParams.set("lang", "id");
      url.searchParams.set("limit", "7");
      url.searchParams.set("apiKey", GEOAPIFY_API_KEY);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch addresses");

      const data = await response.json();
      return (data.features || []).map((feature: any) => ({
        address: feature.properties.formatted || "",
        postal_code: feature.properties.postcode || "",
        lat: String(feature.properties.lat ?? ""),
        lon: String(feature.properties.lon ?? ""),
      }));
    } catch (error) {
      console.error("Error searching address:", error);
      return [];
    }
  },

  /**
   * Get list of supported expeditions.
   */
  getExpeditions: async (): Promise<Expedition[]> => {
    if (!EXPEDITION_API_URL) {
      console.error("EXPEDITION_API_URL is not defined");
      return [];
    }

    try {
      const response = await fetch(EXPEDITION_API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch expeditions");
      }
      const data = await response.json();
      // Assuming data is an array of objects or strings.
      // We'll normalize it to Expedition[]
      if (Array.isArray(data)) {
        // If it's just strings
        if (typeof data[0] === "string") {
          return data.map((name, index) => ({ id: index, name }));
        }
        return data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching expeditions:", error);
      return [];
    }
  },

  /**
   * Calculate shipping cost using internal API.
   */
  checkShippingCost: async (payload: {
    weight: number;
    expedition: string;
    destination_postal_code: string;
    destination_address: string;
    latitude: string;
    longitude: string;
  }): Promise<ShippingCostResponse> => {
    try {
      const response = await fetch("/api/check-shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          results: [],
          error: data.error || "Failed to calculate shipping",
        };
      }

      return data;
    } catch (error) {
      return { success: false, results: [], error: "Network error" };
    }
  },
};

export interface AwbPayload {
  order_info: {
    order_id: string;
    courier: string;
    service_code: string;
    desc_of_goods: string;
  };
  origin: {
    name: string;
    phone: string;
    address_1: string;
    address_2?: string | null;
    city: string;
    zip: string;
    branch_code?: string;
  };
  destination: {
    name: string;
    phone: string;
    address_1: string;
    address_2?: string | null;
    kecamatan?: string;
    city: string;
    state?: string;
    zip: string;
    dest_code?: string;
  };
  package: {
    weight: number;
    qty: number;
    value: number;
  };
}

export interface AwbResponse {
  success: boolean;
  order_id?: string;
  awb?: string;
  barcode_awb?: string;
  expedition_logo?: string;
  error?: string;
}

export const generateAwb = async (
  payload: AwbPayload,
): Promise<AwbResponse> => {
  try {
    const response = await fetch("/api/create-awb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || "Gagal membuat AWB" };
    }
    return data;
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export interface TrackingHistoryItem {
  date: string;
  description: string;
  location: string;
}

export interface TrackingResult {
  courier: string;
  awb: string;
  status_summary: string;
  receiver: string;
  history: TrackingHistoryItem[];
}

export interface TrackingResponse {
  success: boolean;
  result?: TrackingResult;
  error?: string;
}

export const trackAwb = async (
  expedition: string,
  awb_number: string,
): Promise<TrackingResponse> => {
  try {
    const response = await fetch("/api/track-awb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expedition, awb_number }),
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Gagal melacak paket." };
    }

    // Handle internal API error response even if HTTP status is 200
    if (data.result && data.result.status === "error") {
      return {
        success: false,
        error: data.result.message || "Gagal melacak paket.",
      };
    }

    return data;
  } catch {
    return { success: false, error: "Network error" };
  }
};
