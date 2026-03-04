"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import styles from "./TrackingForm.module.css";

interface Props {
  onTrack: (expedition: string, awbNumber: string) => void;
  isLoading: boolean;
}

export default function TrackingForm({ onTrack, isLoading }: Props) {
  const [expedition, setExpedition] = useState("");
  const [awbNumber, setAwbNumber] = useState("");
  const [expeditions, setExpeditions] = useState<string[]>([]);

  useEffect(() => {
    api.getExpeditions().then((data) => {
      const names = data.map((e) => e.name);
      setExpeditions(names);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expedition || !awbNumber.trim()) return;
    onTrack(expedition, awbNumber.trim());
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="expedition">
            Expedisi
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="expedition"
              className={styles.select}
              value={expedition}
              onChange={(e) => setExpedition(e.target.value)}
              required
            >
              <option value="">-- Pilih Expedisi --</option>
              {expeditions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <span className={styles.selectChevron}>▾</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="awbNumber">
            Airway Bill Number
          </label>
          <input
            id="awbNumber"
            type="text"
            className={styles.input}
            placeholder="Masukkan nomor resi..."
            value={awbNumber}
            onChange={(e) => setAwbNumber(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className={styles.button}
        disabled={isLoading || !expedition || !awbNumber.trim()}
      >
        {isLoading ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Track Paket
          </>
        )}
      </button>
    </form>
  );
}
