// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link'; // Import Next.js Link component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My CineRank',
  description: 'Rate movies and TV shows',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global Header */}
        <header className="bg-gray-950 text-white p-4 shadow-md sticky top-0 z-50">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors duration-200">
              {/* You can replace this with an SVG icon if you like */}
              My CineRank
            </Link>
            {/* Potentially add other navigation links here later */}
            {/* <div className="space-x-4">
              <Link href="/my-ratings" className="hover:text-purple-300">My Ratings</Link>
            </div> */}
          </nav>
        </header>

        {/* Main content of each page */}
        {children}
      </body>
    </html>
  );
}