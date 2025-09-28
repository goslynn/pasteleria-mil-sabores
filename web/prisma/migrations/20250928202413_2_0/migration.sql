/*
  Warnings:

  - The primary key for the `CarritoDetalle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `idCarritoDetalle` to the `CarritoDetalle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarritoDetalle" (
    "idCarritoDetalle" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCarrito" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CarritoDetalle_idCarrito_fkey" FOREIGN KEY ("idCarrito") REFERENCES "CarritoCompras" ("idCarrito") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarritoDetalle_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarritoDetalle" ("idCarrito", "idProducto") SELECT "idCarrito", "idProducto" FROM "CarritoDetalle";
DROP TABLE "CarritoDetalle";
ALTER TABLE "new_CarritoDetalle" RENAME TO "CarritoDetalle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
