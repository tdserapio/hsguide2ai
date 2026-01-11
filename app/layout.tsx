import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The High Schooler’s Guide to AI",
  description: "The High Schooler’s Guide to AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased overflow-y-hidden">
        {children}
      </body>
    </html>
  );
}
