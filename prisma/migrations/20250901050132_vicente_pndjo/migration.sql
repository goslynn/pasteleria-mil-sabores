/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarritoCompras" (
    "idCarrito" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuariFk" INTEGER NOT NULL,
    CONSTRAINT "CarritoCompras_idUsuariFk_fkey" FOREIGN KEY ("idUsuariFk") REFERENCES "usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarritoCompras" ("idCarrito", "idUsuariFk") SELECT "idCarrito", "idUsuariFk" FROM "CarritoCompras";
DROP TABLE "CarritoCompras";
ALTER TABLE "new_CarritoCompras" RENAME TO "CarritoCompras";
CREATE UNIQUE INDEX "CarritoCompras_idUsuariFk_key" ON "CarritoCompras"("idUsuariFk");
CREATE TABLE "new_Pedido" (
    "idPedido" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    CONSTRAINT "Pedido_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pedido" ("estado", "fecha", "idPedido", "idUsuarioFk", "total") SELECT "estado", "fecha", "idPedido", "idUsuarioFk", "total" FROM "Pedido";
DROP TABLE "Pedido";
ALTER TABLE "new_Pedido" RENAME TO "Pedido";
CREATE TABLE "new_PreferenciasUsuario" (
    "ioPreferencia" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "diaEntrega" TEXT NOT NULL,
    "medioPago" TEXT NOT NULL,
    CONSTRAINT "PreferenciasUsuario_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "usuario" ("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PreferenciasUsuario" ("diaEntrega", "idUsuarioFk", "ioPreferencia", "medioPago") SELECT "diaEntrega", "idUsuarioFk", "ioPreferencia", "medioPago" FROM "PreferenciasUsuario";
DROP TABLE "PreferenciasUsuario";
ALTER TABLE "new_PreferenciasUsuario" RENAME TO "PreferenciasUsuario";
CREATE UNIQUE INDEX "PreferenciasUsuario_idUsuarioFk_key" ON "PreferenciasUsuario"("idUsuarioFk");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
