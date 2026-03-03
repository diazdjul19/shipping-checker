import { ShippingPlan } from "@/services/api";
import styles from "./ShippingResults.module.css";

interface ShippingResultsProps {
  results: ShippingPlan[];
}

export default function ShippingResults({ results }: ShippingResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.title}>Pilihan Pengiriman</h2>
      <div className={styles.list}>
        {results.map((plan, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.info}>
              <h3 className={styles.serviceName}>{plan.name}</h3>
              <p className={styles.description}>Desc: {plan.description}</p>
              <p className={styles.serviceCode}>Service Code: {plan.service}</p>
              <span className={styles.etd}>{plan.etd}</span>
            </div>
            <div className={styles.price}>
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(plan.cost)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
