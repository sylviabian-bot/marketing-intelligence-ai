import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Marketing Intelligence Analyst",
  description: "A synthetic portfolio prototype for deterministic marketing performance analysis.",
};

const links = [
  ["Intelligence Overview", "/"],
  ["Campaign Intelligence", "/campaigns"],
  ["Methodology", "/methodology"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link href="/" className="brand" aria-label="Marketing Intelligence home">
              <span>Marketing Intelligence</span>
              <small>Analyst workspace · Sprint 01</small>
            </Link>
            <nav aria-label="Primary navigation">
              {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
          </div>
        </header>
        <main className="shell">{children}</main>
        <footer className="shell footer">Synthetic portfolio demonstration · No real customer data</footer>
      </body>
    </html>
  );
}
