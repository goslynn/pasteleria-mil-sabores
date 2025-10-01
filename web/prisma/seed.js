import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // Ejecutar SQL de comunas y regiones
    const sqlFile = join(__dirname, "../seed/insertComunas.sql"); // ruta correcta
    const sql = await readFile(sqlFile, "utf-8");
    await prisma.$executeRawUnsafe(sql);

    // Crear usuario Invitado si no existe
    await prisma.usuario.upsert({
        where: { email: "Invitado@local" },
        update: {},
        create: {
            nombre: "Invitado",
            email: "Invitado@local",
            password: "",
            fechaNacimiento: new Date("2000-01-01"),
            createdAt: new Date("2000-01-01T00:00:00"),
        },
    });

    console.log("Seed completado ✅");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
