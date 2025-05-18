// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import ThemeWrapper from "@/components/ThemeWrapper";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={cn(inter.className, "bg-background text-foreground")}>
        <ThemeWrapper>
          <main className="max-w-7xl mx-auto px-4 py-6" style={{ willChange: "opacity, transform" }}>{children}</main>
        </ThemeWrapper>
      </body>
    </html>
  );
}