import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TRPCReactProvider } from "~/trpc/react";

import { Toaster } from "./_components/ui/toaster";
import { Modal } from "./_components/Modal";
import { LeftSidebar } from "./_components/LeftSidebar";
import { Bottombar } from "./_components/Bottombar";

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          scrollBox: "bg-slate-800",
        },
      }}
    >
      <html lang="en">
        <body className={`font-sans ${inter.variable}`}>
          <TRPCReactProvider>
            <main className="flex h-screen justify-center">
              <LeftSidebar />
              <div
                id="layout"
                className="h-full  w-full overflow-y-scroll md:max-w-xl"
              >
                {children}
              </div>
              <Bottombar />
            </main>
            <Modal />
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
