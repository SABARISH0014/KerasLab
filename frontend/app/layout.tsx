import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Brain, Layers, Cpu, PenTool } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KerasLab - Learn Deep Learning",
  description: "An interactive educational sandbox for beginners to understand and experiment with Deep Learning using Keras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
              <Brain className="w-6 h-6" />
              <span>KerasLab</span>
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <Brain className="w-4 h-4" />
                Learn
              </Link>
              <Link href="/explore" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
                Explore
              </Link>
              <Link href="/build" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <Cpu className="w-4 h-4" />
                Build
              </Link>
              <Link href="/predict" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <PenTool className="w-4 h-4" />
                Predict
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-800 bg-slate-900 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            <p>KerasLab — Learn Deep Learning by Experimenting</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
