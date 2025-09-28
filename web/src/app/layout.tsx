import type {Metadata, Viewport} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import React from "react";
import {ThemeProvider} from "next-themes";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Pasteleria MS",
    description: "Pasteleria Mil Sabbores, la mejor de la galaxia",
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)",  color: "#0b0b0b"  },
    ],
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.JSX.Element;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
};

