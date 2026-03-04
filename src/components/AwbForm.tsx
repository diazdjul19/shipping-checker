"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateAwb, AwbResponse } from "@/services/api";
import styles from "./AwbForm.module.css";

interface AwbFormProps {
  courier: string;
  serviceCode: string;
  prefillWeight?: string;
  prefillDestAddress?: string;
  prefillDestPostal?: string;
}

export default function AwbForm({
  courier,
  serviceCode,
  prefillWeight = "",
  prefillDestAddress = "",
  prefillDestPostal = "",
}: AwbFormProps) {
  const router = useRouter();

  // order_info
  const [orderId, setOrderId] = useState("");
  const [descOfGoods, setDescOfGoods] = useState("");

  // origin — hardcoded, not editable
  const ORIGIN = {
    name: "Javamifi",
    phone: "081908290270",
    address_1: "Jl Bambu Duri 2 No 3B, RT12 RW06 Pd. Bambu",
    address_2: "Kec. Duren Sawit",
    city: "Kota Jakarta Timur",
    zip: "13430",
  };

  // destination
  const [destName, setDestName] = useState("");
  const [destPhone, setDestPhone] = useState("");
  const [destAddress1, setDestAddress1] = useState(prefillDestAddress);
  const [destAddress2, setDestAddress2] = useState("");
  const [destKecamatan, setDestKecamatan] = useState("");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [destZip, setDestZip] = useState(prefillDestPostal);
  const [destCode, setDestCode] = useState("");

  // package
  const [weight, setWeight] = useState(prefillWeight);
  const [qty, setQty] = useState("1");
  const [value, setValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AwbResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      order_info: {
        order_id: orderId,
        courier,
        service_code: serviceCode,
        desc_of_goods: descOfGoods,
      },
      origin: {
        name: ORIGIN.name,
        phone: ORIGIN.phone,
        address_1: ORIGIN.address_1,
        address_2: ORIGIN.address_2,
        city: ORIGIN.city,
        zip: ORIGIN.zip,
      },
      destination: {
        name: destName,
        phone: destPhone,
        address_1: destAddress1,
        address_2: destAddress2,
        kecamatan: destKecamatan,
        city: destCity,
        state: destState,
        zip: destZip,
        dest_code: destCode,
      },
      package: {
        weight: parseFloat(weight),
        qty: parseInt(qty),
        value: parseFloat(value),
      },
    };

    const res = await generateAwb(payload);
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.error || "Gagal membuat AWB.");
    }
  };

  if (result) {
    return (
      <div className={styles.successCard}>
        <div style={{ width: "fit-content" }}>
          <h2 className={styles.successTitle}>AWB Berhasil Dibuat!</h2>
          <hr className={styles.divider} />
        </div>
        <div className={styles.awbInfo}>
          <p className={styles.awbLabel}>Order ID</p>
          <p className={styles.awbValue}>{result.order_id}</p>
        </div>
        <div className={styles.awbInfo}>
          <p className={styles.awbLabel}>Nomor AWB</p>
          <p className={styles.awbNumber}>{result.awb}</p>
        </div>
        {result.barcode_awb && (
          <div className={styles.barcodeSection}>
            <p className={styles.awbLabel}>Barcode</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.barcode_awb}
              alt={`Barcode AWB ${result.awb}`}
              className={styles.barcodeImg}
            />
          </div>
        )}
        {result.expedition_logo && (
          <div className={styles.logoSection}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.expedition_logo}
              alt={`Logo ${courier}`}
              className={styles.expeditionLogo}
            />
          </div>
        )}
        <div className={styles.successActions}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            ← Balik ke Cek Ongkir
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Top info bar: Order ID input + kurir + kode layanan */}
      <div className={styles.readonlyRow}>
        <div className={`${styles.readonlyField} ${styles.orderIdField}`}>
          <label htmlFor="orderId" className={styles.readonlyLabel}>
            Order ID
          </label>
          <input
            id="orderId"
            type="text"
            className={styles.input}
            placeholder="Cth: ORD-2026030490001"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <div className={styles.readonlyField}>
          <span className={styles.readonlyLabel}>Kurir</span>
          <span className={styles.readonlyValue}>{courier}</span>
        </div>
        <div className={styles.readonlyField}>
          <span className={styles.readonlyLabel}>Kode Layanan</span>
          <span className={styles.readonlyValue}>{serviceCode}</span>
        </div>
      </div>

      {/* Order Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Informasi Paket</h3>
        <div className={styles.formGroup}>
          <label htmlFor="descOfGoods">Deskripsi Barang</label>
          <input
            id="descOfGoods"
            type="text"
            className={styles.input}
            placeholder="Cth: Modem WiFi..."
            value={descOfGoods}
            onChange={(e) => setDescOfGoods(e.target.value)}
            required
          />
        </div>
        <div className={styles.row3}>
          <div className={styles.formGroup}>
            <label htmlFor="weight">Berat (Kg)</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              className={styles.input}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="qty">Jumlah</label>
            <input
              id="qty"
              type="number"
              min="1"
              className={styles.input}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="value">Nilai Barang (Rp)</label>
            <input
              id="value"
              type="number"
              min="0"
              className={styles.input}
              placeholder="500000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Origin — hardcoded & disabled */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Pengirim</h3>
        <div className={styles.row2}>
          <div className={styles.formGroup}>
            <label htmlFor="originName">Nama Pengirim</label>
            <input
              id="originName"
              type="text"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={ORIGIN.name}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="originPhone">No. Telepon</label>
            <input
              id="originPhone"
              type="tel"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={ORIGIN.phone}
              disabled
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="originAddress1">Alamat Baris 1</label>
          <input
            id="originAddress1"
            type="text"
            className={`${styles.input} ${styles.inputDisabled}`}
            value={ORIGIN.address_1}
            disabled
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="originAddress2">Alamat Baris 2</label>
          <input
            id="originAddress2"
            type="text"
            className={`${styles.input} ${styles.inputDisabled}`}
            value={ORIGIN.address_2}
            disabled
          />
        </div>
        <div className={styles.row2}>
          <div className={styles.formGroup}>
            <label htmlFor="originCity">Kota</label>
            <input
              id="originCity"
              type="text"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={ORIGIN.city}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="originZip">Kode Pos</label>
            <input
              id="originZip"
              type="text"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={ORIGIN.zip}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Data Penerima</h3>
        <div className={styles.row2}>
          <div className={styles.formGroup}>
            <label htmlFor="destName">Nama Penerima</label>
            <input
              id="destName"
              type="text"
              className={styles.input}
              placeholder="Nama penerima"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destPhone">No. Telepon</label>
            <input
              id="destPhone"
              type="tel"
              className={styles.input}
              placeholder="08xxxxxxxxxx"
              value={destPhone}
              onChange={(e) => setDestPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="destAddress1">Alamat Baris 1</label>
          <input
            id="destAddress1"
            type="text"
            className={styles.input}
            placeholder="Nama jalan & nomor"
            value={destAddress1}
            onChange={(e) => setDestAddress1(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="destAddress2">Alamat Baris 2 (opsional)</label>
          <input
            id="destAddress2"
            type="text"
            className={styles.input}
            placeholder="Blok, RT/RW, dll."
            value={destAddress2}
            onChange={(e) => setDestAddress2(e.target.value)}
          />
        </div>
        <div className={styles.row3}>
          <div className={styles.formGroup}>
            <label htmlFor="destKecamatan">Kecamatan (opsional)</label>
            <input
              id="destKecamatan"
              type="text"
              className={styles.input}
              placeholder="Sukmajaya"
              value={destKecamatan}
              onChange={(e) => setDestKecamatan(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destCity">Kota</label>
            <input
              id="destCity"
              type="text"
              className={styles.input}
              placeholder="Depok"
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="destState">Provinsi (opsional)</label>
            <input
              id="destState"
              type="text"
              className={styles.input}
              placeholder="Jawa Barat"
              value={destState}
              onChange={(e) => setDestState(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.row2}>
          <div className={styles.formGroup}>
            <label htmlFor="destZip">Kode Pos</label>
            <input
              id="destZip"
              type="text"
              className={styles.input}
              placeholder="16411"
              value={destZip}
              onChange={(e) => setDestZip(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.back()}
        >
          ← Kembali
        </button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Membuat AWB..." : "Generate AWB"}
        </button>
      </div>
    </form>
  );
}
