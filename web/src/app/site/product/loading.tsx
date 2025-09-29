
export default function Loading() {
    return (
        <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {/* Card contenedor */}
            <div className="bg-muted rounded-2xl border border-border shadow-md overflow-hidden">
                <div className="min-h-[70vh] grid place-items-center p-4 sm:p-6 md:p-8">
                    <p>Cargando...</p>
                </div>
            </div>
        </div>
    );
}