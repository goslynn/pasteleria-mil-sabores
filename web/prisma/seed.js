import { PrismaClient } from "@prisma/client";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    const sqlFile = join(__dirname, "../seed/insertComunas.sql");
    const sql = await readFile(sqlFile, "utf-8");

    // Separar cada statement por ';' y eliminar líneas vacías
    const statements = sql
        .split(";")
        .map(s => s.trim())
        .filter(Boolean);

    for (const stmt of statements) {
        try {
            await prisma.$executeRawUnsafe(stmt);
        } catch (err) {
            console.error("Error ejecutando SQL:", stmt);
            throw err;
        }
    }

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
