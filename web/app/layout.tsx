import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decamp — AI-Powered Email & Calendar Assistant",
  description:
    "Decamp is your AI-powered email chief of staff. Prioritize messages, detect meetings, and chat with an AI assistant that knows your workflow — all powered by state-of-the-art intelligence.",
  keywords: [
    "email assistant",
    "AI email",
    "smart inbox",
    "calendar assistant",
    "AI productivity",
    "email prioritization",
    "inbox management",
    "Decamp",
  ],
  authors: [{ name: "Decamp" }],
  openGraph: {
    title: "Decamp — AI-Powered Email & Calendar Assistant",
    description:
      "Your AI-powered email chief of staff. Prioritize messages, detect meetings, and chat with an AI assistant that knows your workflow.",
    type: "website",
    locale: "en_US",
    siteName: "Decamp",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decamp — AI-Powered Email & Calendar Assistant",
    description:
      "Your AI-powered email chief of staff. Prioritize messages, detect meetings, and chat with an AI assistant that knows your workflow.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
