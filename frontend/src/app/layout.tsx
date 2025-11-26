import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { createClient as createServerSupabase } from '@/lib/supabase/server'

// Note: RootLayout is async so we can fetch the server-side session and
// inject it into the page to hydrate the browser Supabase client.
// This ensures server-auth and client-auth stay in sync after hydration.

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gerezim",
    description: "Plataforma de gestão de negócios",
    icons: {
        icon: '/logo-icon.ico',
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch server-side session to hydrate client-side
    let initialSession = null
    try {
        const supabase = createServerSupabase()
        const { data } = await supabase.auth.getSession()
        initialSession = data?.session ?? null
    } catch (e) {
        // ignore errors on session fetch — we'll fallback to normal flow
        initialSession = null
    }
    return (
        <html lang="pt-BR">
            <body className={playfair.className}>
                {/* Inject initial session for client to consume when createClient() is called without explicit initialSession */}
                {initialSession && (
                    <script
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: `window.__SUPABASE_INITIAL_SESSION = ${JSON.stringify(initialSession).replace(/</g,'\\u003c')};` }}
                    />
                )}
                {children}
                <Toaster />
            </body>
        </html>
    );
}
