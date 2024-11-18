import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSG Display",
  description: "Displays current OSG stasitics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
