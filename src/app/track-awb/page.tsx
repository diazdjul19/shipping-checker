"use client";

import { useState } from "react";
import TrackingForm from "@/components/TrackingForm";
import TrackingResult from "@/components/TrackingResult";
import { trackAwb, TrackingResult as TResult } from "@/services/api";
import styles from "../page.module.css";
import trackStyles from "./track-awb.module.css";

export default function TrackAwbPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (expedition: string, awbNumber: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await trackAwb(expedition, awbNumber);
      if (res.success && res.result) {
        setResult(res.result);
      } else {
        setError(res.error || "Data tracking tidak ditemukan.");
      }
    } catch {
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
            Tracking <span className={styles.highlight}>AWB</span>
          </h1>
          <p className={styles.subtitle}>
            Lacak posisi paket kamu secara real-time berdasarkan nomor resi.
          </p>
        </header>

        <TrackingForm onTrack={handleTrack} isLoading={loading} />

        {loading && (
          <div className={trackStyles.loadingState}>
            <span className={trackStyles.loadingSpinner} />
            <p>Sedang melacak paket...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {result && <TrackingResult result={result} />}
      </div>
    </main>
  );
}
