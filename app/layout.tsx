import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "The High Schooler’s Guide to AI",
  description: "The High Schooler’s Guide to AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased overflow-y-hidden`}>
        {children}
      </body>
    </html>
  );
}
