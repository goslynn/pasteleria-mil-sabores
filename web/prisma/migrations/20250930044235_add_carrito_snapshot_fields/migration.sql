/*
  Warnings:

  - Added the required column `nombreProducto` to the `CarritoDetalle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioUnitario` to the `CarritoDetalle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarritoDetalle" (
    "idCarritoDetalle" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCarrito" INTEGER NOT NULL,
    "idProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "nombreProducto" TEXT NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "imagenUrl" TEXT,
    CONSTRAINT "CarritoDetalle_idCarrito_fkey" FOREIGN KEY ("idCarrito") REFERENCES "CarritoCompras" ("idCarrito") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarritoDetalle_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarritoDetalle" ("cantidad", "idCarrito", "idCarritoDetalle", "idProducto") SELECT "cantidad", "idCarrito", "idCarritoDetalle", "idProducto" FROM "CarritoDetalle";
DROP TABLE "CarritoDetalle";
ALTER TABLE "new_CarritoDetalle" RENAME TO "CarritoDetalle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
