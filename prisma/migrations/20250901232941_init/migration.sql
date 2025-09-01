/*
  Warnings:

  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `idUsuariFk` on the `CarritoCompras` table. All the data in the column will be lost.
  - Added the required column `idUsuarioFk` to the `CarritoCompras` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "usuario_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "usuario";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarritoCompras" (
    "idCarrito" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    CONSTRAINT "CarritoCompras_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarritoCompras" ("idCarrito") SELECT "idCarrito" FROM "CarritoCompras";
DROP TABLE "CarritoCompras";
ALTER TABLE "new_CarritoCompras" RENAME TO "CarritoCompras";
CREATE UNIQUE INDEX "CarritoCompras_idUsuarioFk_key" ON "CarritoCompras"("idUsuarioFk");
CREATE TABLE "new_Pedido" (
    "idPedido" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    CONSTRAINT "Pedido_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("estado", "fecha", "idPedido", "idUsuarioFk", "total") SELECT "estado", "fecha", "idPedido", "idUsuarioFk", "total" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE TABLE "new_PreferenciasUsuario" (
    "ioPreferencia" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "diaEntrega" TEXT NOT NULL,
    "medioPago" TEXT NOT NULL,
    CONSTRAINT "PreferenciasUsuario_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PreferenciasUsuario" ("diaEntrega", "idUsuarioFk", "ioPreferencia", "medioPago") SELECT "diaEntrega", "idUsuarioFk", "ioPreferencia", "medioPago" FROM "PreferenciasUsuario";
DROP TABLE "PreferenciasUsuario";
ALTER TABLE "new_PreferenciasUsuario" RENAME TO "PreferenciasUsuario";
CREATE UNIQUE INDEX "PreferenciasUsuario_idUsuarioFk_key" ON "PreferenciasUsuario"("idUsuarioFk");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
