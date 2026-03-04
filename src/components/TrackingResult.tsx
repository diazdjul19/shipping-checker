import type { TrackingResult } from "@/services/api";
import styles from "./TrackingResult.module.css";

interface Props {
  result: TrackingResult;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrackingResult({ result }: Props) {
  const sortedHistory = [...result.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className={styles.wrapper}>
      {/* Summary Card */}
      {result.receiver && (
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <div>
              <span className={styles.courier}>{result.courier}</span>
              <span className={styles.awb}>{result.awb}</span>
            </div>
            <span className={styles.statusBadge}>{result.status_summary}</span>
          </div>
          <div className={styles.receiverRow}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              Penerima: <strong>{result.receiver}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className={styles.timelineSection}>
        <h3 className={styles.timelineTitle}>Riwayat Pengiriman</h3>
        <div className={styles.timeline}>
          {sortedHistory.map((item, i) => {
            const isLatest = i === sortedHistory.length - 1;
            return (
              <div
                key={i}
                className={`${styles.step} ${isLatest ? styles.stepActive : ""}`}
              >
                <div className={styles.stepTrack}>
                  <div
                    className={`${styles.dot} ${isLatest ? styles.dotActive : ""}`}
                  >
                    {isLatest && <span className={styles.pulse} />}
                  </div>
                  {i < sortedHistory.length - 1 && (
                    <div className={styles.line} />
                  )}
                </div>
                <div className={styles.stepContent}>
                  <p className={styles.stepDate}>{formatDate(item.date)}</p>
                  <p
                    className={`${styles.stepDesc} ${isLatest ? styles.stepDescActive : ""}`}
                  >
                    {item.description}
                  </p>
                  <p className={styles.stepLocation}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {item.location}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
