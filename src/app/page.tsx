"use client";

import { useState } from "react";
import ShippingForm from "@/components/ShippingForm";
import ShippingResults from "@/components/ShippingResults";
import { api, ShippingPlan } from "@/services/api";
import styles from "./page.module.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShippingPlan[]>([]);
  const [error, setError] = useState("");
  const [shippingContext, setShippingContext] = useState<
    | {
        expedition: string;
        destination_address: string;
        destination_postal_code: string;
        weight: number;
      }
    | undefined
  >(undefined);

  const handleCheckShipping = async (payload: any) => {
    setLoading(true);
    setError("");
    setResults([]);
    setShippingContext({
      expedition: payload.expedition,
      destination_address: payload.destination_address,
      destination_postal_code: payload.destination_postal_code,
      weight: payload.weight,
    });

    try {
      const response = await api.checkShippingCost(payload);
      if (response.success) {
        setResults(response.results);
      } else {
        setError(response.error || "Gagal mengecek ongkir.");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Cek Ongkir <span className={styles.highlight}>Logistik</span>
          </h1>
          <p className={styles.subtitle}>
            Cek biaya pengiriman dengan cepat dan akurat ke seluruh Indonesia.
          </p>
        </header>

        <ShippingForm
          onCheckShipping={handleCheckShipping}
          isLoading={loading}
        />

        {error && <div className={styles.error}>{error}</div>}

        <ShippingResults results={results} shippingContext={shippingContext} />

        <footer
          className={styles.footer}
          style={{
            marginTop: "2rem",
            paddingTop: "1rem",
            borderTop: "1px solid #eaeaea",
            fontSize: "0.9rem",
            color: "#666",
          }}
        >
          <p>
            <strong>Informasi Pengirim:</strong>
          </p>
          <p>Jl Bambu Duri 2 No 3B, RT12 RW06 Pd. Bambu, Kec. Duren Sawit, </p>
          <p>Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13430</p>
          <p>
            <a href="mailto:it@javamifi.com">it@javamifi.com</a> |{" "}
            <a href="tel:081908290270">081908290270</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
