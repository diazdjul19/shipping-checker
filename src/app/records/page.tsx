import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface AwbRecord {
  order_id: string;
  awb: string;
  barcode_awb?: string;
  expedition_logo?: string;
  courier: string;
  service_code: string;
  recipient_name: string;
  recipient_city: string;
  weight: number;
  created_at: string;
}

async function getRecords(): Promise<AwbRecord[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "awb-records.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    const records = JSON.parse(fileContents);
    return Array.isArray(records) ? records.reverse() : [];
  } catch (error) {
    console.error("Failed to read awb records:", error);
    return [];
  }
}

export default async function RecordsPage() {
  const records = await getRecords();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Riwayat <span className={styles.highlight}>AWB</span>
          </h1>
          <p className={styles.subtitle}>
            Daftar Air Waybill yang telah berhasil dibuat.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.backBtn}>
              &larr; Kembali ke Home
            </Link>
          </div>
        </header>

        {records.length === 0 ? (
          <div className={styles.emptyState}>
            Belum ada riwayat pembuatan AWB.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Order ID</th>
                  <th>AWB / Resi</th>
                  <th>Kurir</th>
                  <th>Layanan</th>
                  <th>Penerima</th>
                  <th>Kota</th>
                  <th>Barcode</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.awb}>
                    <td>
                      {new Date(record.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>{record.order_id}</td>
                    <td className={styles.awbCell}>
                      <strong>{record.awb}</strong>
                    </td>
                    <td>
                      <div className={styles.courierCell}>
                        {record.expedition_logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={record.expedition_logo}
                            alt={record.courier}
                            className={styles.logo}
                          />
                        )}
                      </div>
                    </td>
                    <td>{record.service_code}</td>
                    <td>{record.recipient_name}</td>
                    <td>{record.recipient_city}</td>
                    <td>
                      {record.barcode_awb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={record.barcode_awb}
                          alt="barcode"
                          className={styles.barcode}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
