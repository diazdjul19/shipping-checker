import { NextResponse } from "next/server";

interface ShippingPlan {
  service: string;
  description: string;
  etd: string; // Estimated Time of Delivery
  cost: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weight, expedition, postalCode } = body;

    // Validate input
    if (!weight || !expedition || !postalCode) {
      return NextResponse.json(
        { error: "Weight, expedition, and postal code are required." },
        { status: 400 },
      );
    }

    const weightNum = Number(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      return NextResponse.json({ error: "Invalid weight." }, { status: 400 });
    }

    // Simulate realistic dummy data based on expedition
    let plans: ShippingPlan[] = [];

    // Base cost calculation logic (just for variety)
    const baseRate = 10000;
    const weightFactor = Math.ceil(weightNum) * 5000;

    // Generate plans based on selected expedition
    // In a real app, this would come from a 3rd party API
    if (expedition.toLowerCase().includes("jne")) {
      plans = [
        {
          service: "REG",
          description: "Layanan Reguler",
          etd: "2-3 Hari",
          cost: baseRate + weightFactor,
        },
        {
          service: "YES",
          description: "Yakin Esok Sampai",
          etd: "1 Hari",
          cost: (baseRate + weightFactor) * 1.5,
        },
        {
          service: "JTR",
          description: "JNE Trucking",
          etd: "5-7 Hari",
          cost: (baseRate + weightFactor) * 0.4 + 25000, // Min charge usually
        },
      ];
    } else if (expedition.toLowerCase().includes("sicepat")) {
      plans = [
        {
          service: "HALU",
          description: "Harga Lima Ribu",
          etd: "2-4 Hari",
          cost: baseRate * 0.8 + weightFactor,
        },
        {
          service: "GOKIL",
          description: "Cargo Kilat",
          etd: "3-6 Hari",
          cost: (baseRate + weightFactor) * 0.5,
        },
        {
          service: "BEST",
          description: "Besok Sampai Tujuan",
          etd: "1 Hari",
          cost: (baseRate + weightFactor) * 1.4,
        },
      ];
    } else {
      // Generic Fallback
      plans = [
        {
          service: "Standard",
          description: "Standard Shipping",
          etd: "3-5 Days",
          cost: baseRate + weightFactor,
        },
        {
          service: "Express",
          description: "Express Shipping",
          etd: "1-2 Days",
          cost: (baseRate + weightFactor) * 1.6,
        },
      ];
    }

    // Add a slight random variance to make it look "live"
    plans = plans.map((p) => ({
      ...p,
      cost: Math.floor(p.cost),
    }));

    return NextResponse.json({
      success: true,
      origin: "Jakarta (Dummy)", // Simulating origin
      destination_postal: postalCode,
      expedition: expedition,
      weight: weightNum,
      results: plans,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
