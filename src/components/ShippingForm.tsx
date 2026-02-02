"use client";

import { useState, useEffect } from "react";
import { api, AddressResult, Expedition } from "@/services/api";
import styles from "./ShippingForm.module.css";

interface ShippingFormProps {
  onCheckShipping: (payload: any) => void;
  isLoading: boolean;
}

export default function ShippingForm({
  onCheckShipping,
  isLoading,
}: ShippingFormProps) {
  const [addressQuery, setAddressQuery] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(
    null,
  );
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    async function fetchExpeditions() {
      const data = await api.getExpeditions();
      setExpeditions(data);
    }
    fetchExpeditions();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (
        addressQuery.length >= 3 &&
        addressQuery !== selectedAddress?.address
      ) {
        const results = await api.searchAddress(addressQuery);
        setAddressResults(results);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [addressQuery, selectedAddress]);

  const handleSelectAddress = (address: AddressResult) => {
    setSelectedAddress(address);
    setAddressQuery(address.address);
    setPostalCode(address.postal_code);
    setLat(address.lat);
    setLon(address.lon);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress || !selectedExpedition || !weight) return;

    onCheckShipping({
      weight: parseFloat(weight),
      expedition: selectedExpedition,
      postalCode: postalCode,
      lat: lat,
      lon: lon,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="address">Tujuan Pengiriman</label>
          <div className={styles.autocompleteWrapper}>
            <input
              id="address"
              type="text"
              className={styles.input}
              placeholder="Cari kelurahan / kecamatan / kota..."
              value={addressQuery}
              onFocus={() => {
                if (
                  addressQuery.length >= 3 &&
                  addressQuery !== selectedAddress?.address
                ) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => {
                setAddressQuery(e.target.value);
                if (
                  selectedAddress &&
                  e.target.value !== selectedAddress.address
                ) {
                  setSelectedAddress(null);
                }
              }}
              autoComplete="off"
              required
            />
            {showSuggestions && addressResults.length > 0 && (
              <ul className={styles.suggestions}>
                {addressResults.map((item, idx) => (
                  <li key={idx} onClick={() => handleSelectAddress(item)}>
                    {item.address} ({item.postal_code})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="postalCode">Postal Code</label>
          <input
            id="postalCode"
            type="text"
            className={styles.input}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lat">Latitude</label>
          <input
            id="lat"
            type="text"
            className={styles.input}
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lon">Longitude</label>
          <input
            id="lon"
            type="text"
            className={styles.input}
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="expedition">Ekspedisi</label>
          <select
            id="expedition"
            className={styles.select}
            value={selectedExpedition}
            onChange={(e) => setSelectedExpedition(e.target.value)}
            required
          >
            <option value="">Pilih Ekspedisi</option>
            {expeditions.map((exp) => (
              <option key={exp.id} value={exp.name}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="weight">Berat (Kg)</label>
          <input
            id="weight"
            type="number"
            className={styles.input}
            placeholder="0.0"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading || !selectedAddress}
      >
        {isLoading ? "Memuat..." : "Cek Ongkir"}
      </button>
    </form>
  );
}
