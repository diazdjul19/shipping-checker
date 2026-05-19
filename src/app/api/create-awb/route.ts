import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const AWB_API_URL = process.env.AWB_API_URL;
    if (!AWB_API_URL) {
      return NextResponse.json(
        { error: "AWB_API_URL is not defined" },
        { status: 500 },
      );
    }

    const { order_info, origin, destination, package: pkg } = body;

    const payload = {
      order_info: {
        order_id: order_info.order_id,
        courier: order_info.courier,
        service_code: order_info.service_code,
        desc_of_goods: order_info.desc_of_goods,
      },
      origin: {
        name: origin.name,
        phone: origin.phone,
        address_1: origin.address_1,
        address_2: origin.address_2 ?? null,
        city: origin.city,
        zip: parseInt(process.env.ORIGIN_POSTAL_CODE || "0"),
        latitude: parseFloat(process.env.ORIGIN_LAT || "0"),
        longitude: parseFloat(process.env.ORIGIN_LNG || "0"),
      },
      destination: {
        name: destination.name,
        phone: destination.phone,
        address_1: destination.address_1,
        address_2: destination.address_2 ?? null,
        city: destination.city,
        zip: destination.zip,
        latitude: Number(destination.latitude) || 0,
        longitude: Number(destination.longitude) || 0,
      },
      package: {
        weight: Number(pkg.weight),
        qty: Number(pkg.qty),
        value: Number(pkg.value),
        is_insurance: "N",
        is_cod: "N",
        cod_amount: 0,
      },
    };

    const externalRes = await fetch(AWB_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xauth-service-delivery": process.env.XAUTH_SERVICE_DELIVERY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!externalRes.ok) {
      const errText = await externalRes.text();
      console.error("AWB API Error:", errText);
      return NextResponse.json(
        { error: "Gagal membuat AWB dari provider." },
        { status: 502 },
      );
    }

    const externalData = await externalRes.json();

    // Response is an array: [{ awb, barcode_awb, expedition_logo }]
    const awbResult = Array.isArray(externalData)
      ? externalData[0]
      : externalData;

    if (!awbResult?.awb) {
      console.error("Unexpected AWB response:", externalData);
      return NextResponse.json(
        { error: "Response AWB tidak valid." },
        { status: 502 },
      );
    }

    // Save to data/awb-records.json
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "awb-records.json");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let records: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        records = JSON.parse(raw);
      } catch {
        records = [];
      }
    }

    const newRecord = {
      order_id: order_info.order_id,
      awb: awbResult.awb,
      barcode_awb: awbResult.barcode_awb,
      expedition_logo: awbResult.expedition_logo,
      courier: order_info.courier,
      service_code: order_info.service_code,
      recipient_name: destination.name,
      recipient_city: destination.city,
      weight: pkg.weight,
      created_at: new Date().toISOString(),
    };

    records.push(newRecord);
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      order_id: order_info.order_id,
      awb: awbResult.awb,
      barcode_awb: awbResult.barcode_awb,
      expedition_logo: awbResult.expedition_logo,
    });
  } catch (error) {
    console.error("Create AWB Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
