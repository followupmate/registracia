import "./globals.css";

export const metadata = {
  title: "Športový Deň 2026 — Registrácia",
  description: "Zaregistruj sa na firemný Športový Deň 2026. Vyber si disciplíny a turnaje.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>{children}</body>
    </html>
  );
}
