import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gerezim Intermediações",
    description: "Plataforma de gestão de negócios",
    icons: {
        icon: '/logo-icon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={playfair.className}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
