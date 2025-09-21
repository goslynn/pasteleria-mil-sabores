"use client";

export function LogoutButton() {
    const handleLogout = async () => {
        await fetch("/api/session", { method: "DELETE" });
        // Opcional: recarga la página o navega al login
        window.location.href = "/auth/login";
    };

    return (
        <button onClick={handleLogout}>
            Cerrar sesión
        </button>
    );
}
