"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { api, AddressResult, Expedition } from "@/services/api";
import styles from "./ShippingForm.module.css";

// Dynamic import to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

const INDONESIA_CENTER: [number, number] = [-2.5, 118.0];
const INDONESIA_ZOOM = 5;
const DETAIL_ZOOM = 15;

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

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDONESIA_CENTER);
  const [mapZoom, setMapZoom] = useState(INDONESIA_ZOOM);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);

  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState("");
  const [weight, setWeight] = useState("");

  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";

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

    if (address.lat && address.lon) {
      const center: [number, number] = [
        parseFloat(address.lat),
        parseFloat(address.lon),
      ];
      setMapCenter(center);
      setMapZoom(DETAIL_ZOOM);
      setMarkerPosition(center);
    }
  };

  const handleLocationChange = (newLat: number, newLng: number) => {
    const latStr = newLat.toFixed(7);
    const lngStr = newLng.toFixed(7);
    setLat(latStr);
    setLon(lngStr);
    setMarkerPosition([newLat, newLng]);
    // Ensure submit is possible even if location picked from map only
    if (!selectedAddress) {
      setSelectedAddress({
        address: addressQuery || "Lokasi dari peta",
        postal_code: postalCode,
        lat: latStr,
        lon: lngStr,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpedition || !weight || !lat || !lon) return;

    onCheckShipping({
      weight: parseFloat(weight),
      expedition: selectedExpedition,
      destination_postal_code: postalCode,
      destination_address: selectedAddress?.address || addressQuery || "",
      latitude: lat,
      longitude: lon,
    });
  };

  const isLocationSet = lat !== "" && lon !== "";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Tujuan Pengiriman */}
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
                  setMarkerPosition(null);
                  setLat("");
                  setLon("");
                }
              }}
              autoComplete="off"
            />
            {showSuggestions && addressResults.length > 0 && (
              <ul className={styles.suggestions}>
                {addressResults.map((item, idx) => (
                  <li key={idx} onClick={() => handleSelectAddress(item)}>
                    <span className={styles.suggestionMain}>{item.address}</span>
                    {item.postal_code && (
                      <span className={styles.suggestionPostal}>
                        {item.postal_code}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Map Picker */}
      <div className={styles.row}>
        <div className={styles.formGroupFull}>
          <label>Pilih Lokasi di Peta</label>
          <MapPicker
            center={mapCenter}
            zoom={mapZoom}
            markerPosition={markerPosition}
            onLocationChange={handleLocationChange}
            apiKey={geoapifyKey}
          />
          <p className={styles.mapHint}>
            💡 Klik pada peta atau drag marker untuk menyesuaikan lokasi pinpoint
          </p>
        </div>
      </div>

      {/* Postal Code, Lat, Lon */}
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="postalCode">Postal Code</label>
          <input
            id="postalCode"
            type="text"
            className={styles.input}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lat">Latitude</label>
          <input
            id="lat"
            type="text"
            className={`${styles.input} ${styles.readOnly}`}
            value={lat}
            readOnly
            placeholder="Pilih dari peta"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="lon">Longitude</label>
          <input
            id="lon"
            type="text"
            className={`${styles.input} ${styles.readOnly}`}
            value={lon}
            readOnly
            placeholder="Pilih dari peta"
          />
        </div>
      </div>

      {/* Ekspedisi & Berat */}
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
        disabled={isLoading || !isLocationSet}
      >
        {isLoading ? "Memuat..." : "Cek Ongkir"}
      </button>
    </form>
  );
}
