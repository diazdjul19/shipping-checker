"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface GosendLog {
  id: number;
  event_id: string;
  event_date: number;
  entity_id: string;
  event_type: string;
  booking_id: string;
  status: string;
  booking_type: string;
  cancelled_by: string;
  cancellation_reason: string;
  driver_name: string;
  driver_phone: string;
  driver_photo_url: string;
  receiver_name: string;
  total_distance_in_kms: string;
  pickup_eta: string;
  delivery_eta: string;
  price: string;
  live_tracking_url: string;
  is_processed: number;
  created_at: string;
  updated_at: string;
  raw_payload?: any;
}

export default function GosendLogRow({ log }: { log: GosendLog }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
        <td>{log.created_at}</td>
        <td className={styles.awbCell}>
          <strong>{log.booking_id}</strong>
        </td>
        <td>
          <span
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              backgroundColor:
                log.status === "no_driver" || log.status === "cancelled"
                  ? "#fee2e2"
                  : log.status === "delivered"
                    ? "#dcfce7"
                    : "#f3f4f6",
              color:
                log.status === "no_driver" || log.status === "cancelled"
                  ? "#991b1b"
                  : log.status === "delivered"
                    ? "#166534"
                    : "#1f2937",
            }}
          >
            {log.status.toUpperCase()}
          </span>
        </td>
        <td>{log.event_type}</td>
        <td>
          {log.driver_name ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>{log.driver_name}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {log.driver_phone}
              </span>
            </div>
          ) : (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              Belum ada driver
            </span>
          )}
        </td>
        <td>
          {log.price
            ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(Number(log.price))
            : "-"}
        </td>
        <td>
          {log.live_tracking_url ? (
            <a
              href={log.live_tracking_url}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--primary-color)",
                textDecoration: "underline",
                fontSize: "0.9rem",
              }}
            >
              Lacak Peta
            </a>
          ) : (
            "-"
          )}
        </td>
        <td>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              background: expanded ? "var(--bg-secondary)" : "transparent",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {expanded ? "Tutup" : "Detail"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} style={{ padding: "0" }}>
            <div className={styles.expandedContent}>
              <pre className={styles.jsonPre}>
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
