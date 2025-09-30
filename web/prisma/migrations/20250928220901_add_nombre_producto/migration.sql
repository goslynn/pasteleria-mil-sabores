/*
  Warnings:

  - A unique constraint covering the columns `[idCarrito,idProducto]` on the table `CarritoDetalle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Producto" (
    "idProducto" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenciaProductos" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL
);
INSERT INTO "new_Producto" ("idProducto", "referenciaProductos") SELECT "idProducto", "referenciaProductos" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CarritoDetalle_idCarrito_idProducto_key" ON "CarritoDetalle"("idCarrito", "idProducto");
