import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Github, Mail } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SW마에스트로 프로젝트",
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
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-bold hover:opacity-80 transition-opacity"
            >
              SW마에스트로 프로젝트
            </Link>
            <a
              href="https://open.kakao.com/o/sFa5F6rh"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#FEE500] text-black rounded-md hover:bg-[#FEE500]/90 transition-colors"
            >
              문의하기
            </a>
          </div>
        </header>
        {children}
        <footer className="border-t mt-12">
          <div className="container mx-auto py-6 px-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <a
                  href="https://github.com/wibaek/soma-projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="mailto:devmuromi@gmail.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                <p>소프트웨어 마에스트로 프로젝트</p>
                <div className="mt-2 flex gap-4 justify-center">
                  <Link
                    href="https://www.swmaestro.org/sw/singl/projectIntc/list.do?menuNo=200013"
                    className="hover:underline"
                  >
                    주요 프로젝트 소개
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId="G-4T61K4G2VE" />
    </html>
  );
}
