import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "AsobiHub",
    template: "%s | AsobiHub",
  },
  description: "Discover, share, and enjoy the best game. Join the AsobiHub!",
  keywords: [
    "AsobiHub",
    'game',
    'marketplace',
    'anime',
    'horror',
    'hub'
  ],
  authors: [{ name: "AsobiHub Team", url: "https://asobi-hub.vercel.app" }],
  openGraph: {
    title: "AsobiHub",
    description: "Discover, share, and enjoy the best game. Join the AsobiHub!",
    url: "https://asobi-hub.vercel.app",
    siteName: "AsobiHub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AsobiHub",
    description: "Discover, share, and enjoy the best game. Join the AsobiHub!",
    creator: "@kasurtrbang",
  },
  metadataBase: new URL("https://asobi-hub.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
