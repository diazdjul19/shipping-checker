"use client";

import { useRouter } from "next/navigation";
import { ShippingPlan } from "@/services/api";
import styles from "./ShippingResults.module.css";

interface ShippingResultsProps {
  results: ShippingPlan[];
  shippingContext?: {
    expedition: string;
    destination_address: string;
    destination_postal_code: string;
    weight: number;
  };
}

export default function ShippingResults({
  results,
  shippingContext,
}: ShippingResultsProps) {
  const router = useRouter();

  if (results.length === 0) return null;

  const handleSelectService = (plan: ShippingPlan) => {
    const params = new URLSearchParams({
      courier: shippingContext?.expedition || "",
      service_code: plan.service,
      cost: String(plan.cost),
      etd: plan.etd,
      weight: String(shippingContext?.weight || ""),
      dest_address: shippingContext?.destination_address || "",
      dest_postal: shippingContext?.destination_postal_code || "",
    });
    router.push(`/create-awb?${params.toString()}`);
  };

  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.title}>Pilihan Pengiriman</h2>
      <p className={styles.subtitle}>
        Klik salah satu layanan untuk membuat AWB
      </p>
      <div className={styles.list}>
        {results.map((plan, index) => (
          <div
            key={index}
            className={`${styles.card} ${styles.clickable}`}
            onClick={() => handleSelectService(plan)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleSelectService(plan)}
          >
            <div className={styles.info}>
              <h3 className={styles.serviceName}>{plan.name}</h3>
              <p className={styles.description}>Desc: {plan.description}</p>
              <p className={styles.serviceCode}>Service Code: {plan.service}</p>
              <span className={styles.etd}>{plan.etd}</span>
            </div>
            <div className={styles.rightSide}>
              <div className={styles.price}>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(plan.cost)}
              </div>
              <span className={styles.selectBtn}>Pilih →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
