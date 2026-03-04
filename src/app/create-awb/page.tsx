"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AwbForm from "@/components/AwbForm";
import styles from "./page.module.css";

function CreateAwbContent() {
  const params = useSearchParams();

  const courier = params.get("courier") || "";
  const serviceCode = params.get("service_code") || "";
  const cost = params.get("cost") || "";
  const etd = params.get("etd") || "";
  const weight = params.get("weight") || "";
  const destAddress = params.get("dest_address") || "";
  const destPostal = params.get("dest_postal") || "";

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Buat <span className={styles.highlight}>AWB</span>
          </h1>
          <p className={styles.subtitle}>
            Isi data pengiriman untuk membuat Air Waybill (resi pengiriman).
          </p>
        </header>

        {/* Service info banner */}
        {courier && serviceCode && (
          <div className={styles.infoBanner}>
            <span>
              <strong>{courier}</strong>
            </span>
            <span>
              Layanan: <strong>{serviceCode}</strong>
            </span>
            {cost && (
              <span>
                Ongkir:{" "}
                <strong>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(Number(cost))}
                </strong>
              </span>
            )}
            {etd && (
              <span>
                Estimasi: <strong>{etd}</strong>
              </span>
            )}
          </div>
        )}

        <AwbForm
          courier={courier}
          serviceCode={serviceCode}
          prefillWeight={weight}
          prefillDestAddress={destAddress}
          prefillDestPostal={destPostal}
        />
      </div>
    </main>
  );
}

export default function CreateAwbPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>
      }
    >
      <CreateAwbContent />
    </Suspense>
  );
}
