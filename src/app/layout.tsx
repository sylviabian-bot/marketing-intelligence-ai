import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Marketing Intelligence Analyst",
  description: "Evidence-grounded marketing analytics portfolio prototype combining deterministic performance intelligence, verified customer feedback and bounded AI interpretation.",
};

const links = [
  ["Intelligence Overview", "/"],
  ["Campaign Intelligence", "/campaigns"],
  ["Customer Intelligence", "/customer-intelligence"],
  ["AI Analyst", "/analyst"],
  ["Case Study", "/case-study"],
  ["Methodology", "/methodology"],
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link href="/" className="brand" aria-label="Marketing Intelligence home">
              <span>AI Marketing Intelligence Analyst</span>
              <small>Portfolio prototype · Synthetic evidence</small>
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
