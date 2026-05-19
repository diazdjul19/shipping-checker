"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = [{ href: "/", label: "Cek Ongkir" }];

const awbLinks = [
  { href: "/track-awb", label: "Tracking AWB" },
  { href: "/records", label: "Riwayat AWB" },
  { href: "/gosend-logs", label: "Log GoSend - DEV" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10V6a2 2 0 0 0-1.16-1.82L13 1a2 2 0 0 0-2 0L4.16 4.18A2 2 0 0 0 3 6v4" />
            <path d="M3 10l9 5 9-5" />
            <path d="M3 14l9 5 9-5" />
            <path d="M3 18l9 5 9-5" />
          </svg>
          Master<span>Logistik</span>
        </Link>
        <div className={styles.links}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${pathname === href ? styles.linkActive : ""}`}
            >
              {label}
            </Link>
          ))}

          <div className={styles.dropdown}>
            <span
              className={`${styles.link} ${styles.dropdownBtn} ${awbLinks.some((l) => pathname === l.href) ? styles.linkActive : ""}`}
            >
              Menu AWB
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
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
            <div className={styles.dropdownContent}>
              {awbLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.dropdownItem} ${pathname === href ? styles.linkActive : ""}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
