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

  const handleCheckShipping = async (payload: any) => {
    setLoading(true);
    setError("");
    setResults([]);

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

        <ShippingResults results={results} />
      </div>
    </main>
  );
}
