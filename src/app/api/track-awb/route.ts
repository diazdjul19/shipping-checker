import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const TRACKING_API_URL = process.env.AWB_TRACKING;
    if (!TRACKING_API_URL) {
      return NextResponse.json(
        { error: "AWB_TRACKING is not defined" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { expedition, awb_number } = body;

    if (!expedition || !awb_number) {
      return NextResponse.json(
        { success: false, error: "Expedition dan AWB number wajib diisi." },
        { status: 400 },
      );
    }

    const response = await fetch(TRACKING_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expedition, awb_number }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { success: false, error: `Upstream error: ${errText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // The external API returns an array; unwrap the first item.
    const result = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Track AWB error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada sistem." },
      { status: 500 },
    );
  }
}
