import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";

import { Toaster } from "./_components/ui/toaster";
import { CreateComment } from "./_components/CreateComment";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Pyjama Portal",
  description: "Social media app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${inter.variable}`}>
          <TRPCReactProvider>
            <main className="flex h-screen justify-center">
              <div className="h-full  w-full overflow-y-scroll md:max-w-xl">
                {children}
              </div>
            </main>
            <CreateComment />
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
