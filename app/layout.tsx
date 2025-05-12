import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advisor Connect",
  description: "Scheduling tool for advisors to meet with their clients",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const headersList = headers();

  return (
    <html lang="en">
      <head>
        <title>Advisor Scheduling App</title>
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster />
            {session?.user?.email && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (async () => {
                      try {
                        const email = ${JSON.stringify(session.user.email)};
                        const storage = localStorage.getItem('schedulingLinks');
                        if (storage) {
                          const response = await fetch('/api/migrate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                          });
                          if (response.ok) {
                            console.log('Migration completed');
                          }
                        }
                      } catch (error) {
                        console.error('Migration failed:', error);
                      }
                    })();
                  `,
                }}
              />
            )}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
