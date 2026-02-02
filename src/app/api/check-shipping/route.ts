import { NextResponse } from "next/server";

interface ShippingPlan {
  service: string;
  description: string;
  etd: string;
  cost: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      weight,
      expedition,
      destination_postal_code,
      destination_address,
      latitude,
      longitude,
    } = body;

    // Validate input
    if (!weight || !expedition || !destination_postal_code) {
      return NextResponse.json(
        { error: "Weight, expedition, and postal code are required." },
        { status: 400 },
      );
    }

    const payload = {
      expedition,
      destination_address: destination_address || "",
      destination_postal_code,
      latitude: latitude || "",
      longitude: longitude || "",
      weight: Number(weight),
    };

    const RATES_API_URL = process.env.RATES_API_URL;

    if (!RATES_API_URL) {
      console.error("RATES_API_URL is not defined");
      return NextResponse.json(
        { error: "RATES_API_URL is not defined" },
        { status: 500 },
      );
    }

    const externalApiResponse = await fetch(RATES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      console.error("External API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch shipping rates from provider." },
        { status: 502 },
      );
    }

    const externalData = await externalApiResponse.json();

    // Check for specific error response from external API
    if (
      Array.isArray(externalData) &&
      externalData.length > 0 &&
      externalData[0]?.status === "error"
    ) {
      return NextResponse.json(
        { error: externalData[0].message || "External API Error" },
        { status: externalData[0].code || 400 },
      );
    }

    // Check if the response follows the expected structure
    // Expected: [{ meta: {...}, data: [ ... ] }]
    if (
      !Array.isArray(externalData) ||
      externalData.length === 0 ||
      !externalData[0].data
    ) {
      console.error("Unexpected External API Response:", externalData);
      return NextResponse.json(
        { error: "Invalid response from shipping provider." },
        { status: 502 },
      );
    }

    const rates = externalData[0].data.map((rate: any) => ({
      name: rate.name,
      service: rate.service,
      description: rate.description,
      etd: rate.etd,
      cost: rate.cost,
    }));

    return NextResponse.json({
      success: true,
      origin: "Jakarta", // As per user context, might be fixed or dynamic later
      destination_postal: destination_postal_code,
      expedition: expedition,
      weight: payload.weight,
      results: rates,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
