import AppFooter from "@/components/app-footer";
import { AppNavbar } from "@/components/app-navbar";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* altura navbar -> --site-header */}
            <div className="h-16 sm:h-20 [--site-header:theme(spacing.16)] sm:[--site-header:theme(spacing.20)]">
                <AppNavbar />
            </div>

            {/* margen superior/inferior visible y también como variable --page-gap */}
            <main className="
          flex-1 flex flex-col
          py-6 sm:py-8 lg:py-10
          [--page-gap:theme(spacing.6)]
          sm:[--page-gap:theme(spacing.8)]
          lg:[--page-gap:theme(spacing.10)]
        ">
                {children}
            </main>

            {/* altura footer -> --site-footer */}
            <div className="h-12 sm:h-16 [--site-footer:theme(spacing.12)] sm:[--site-footer:theme(spacing.16)]">
                <AppFooter />
            </div>
        </div>
    );
}
