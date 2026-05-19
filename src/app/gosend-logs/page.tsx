import Link from "next/link";
import styles from "./page.module.css";
import GosendLogRow from "./GosendLogRow";

export const dynamic = "force-dynamic";

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
}

async function getGosendLogs(): Promise<GosendLog[]> {
  try {
    const apiUrl = process.env.GOSEND_CALLBACK_LOGS;
    const authHeader = process.env.XAUTH_SERVICE_DELIVERY;

    if (!apiUrl || !authHeader) {
      console.error("Missing environment variables for GOSEND_CALLBACK_LOGS");
      return [];
    }

    const res = await fetch(apiUrl, {
      headers: {
        "xauth-service-delivery": authHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch gosend logs:", res.status);
      return [];
    }

    const responseData = await res.json();
    
    // The response is directly an array according to the example
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    // Fallback if it's wrapped in an object like { data: [...] }
    if (responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch gosend logs:", error);
    return [];
  }
}

export default async function GosendLogsPage() {
  const logs = await getGosendLogs();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Log <span className={styles.highlight}>GoSend Callback</span>
          </h1>
          <p className={styles.subtitle}>
            Riwayat event log webhook dari GoSend.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.backBtn}>
              &larr; Kembali ke Home
            </Link>
          </div>
        </header>

        {logs.length === 0 ? (
          <div className={styles.emptyState}>
            Belum ada log GoSend yang tercatat.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Waktu Dibuat</th>
                  <th>Booking ID</th>
                  <th>Status</th>
                  <th>Tipe Event</th>
                  <th>Driver</th>
                  <th>Harga</th>
                  <th>Tracking</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <GosendLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
