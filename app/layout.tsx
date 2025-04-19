import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "소프트웨어 마에스트로 프로젝트",
  description: "소프트웨어 마에스트로 프로그램의 프로젝트를 쉽게 탐색하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <header className="border-b">
          <div className="container mx-auto py-4 px-4">
            <h1 className="text-xl font-bold">
              소프트웨어 마에스트로 프로젝트
            </h1>
          </div>
        </header>
        {children}
        <footer className="border-t mt-12">
          <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} 소프트웨어 마에스트로 프로젝트 쇼케이스
          </div>
        </footer>
      </body>
    </html>
  );
}
