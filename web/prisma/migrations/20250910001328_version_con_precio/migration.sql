/*
  Warnings:

  - Added the required column `precioProducto` to the `Precio` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Precio" (
    "idPrecio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idProductoFk" INTEGER NOT NULL,
    "idListaFk" INTEGER NOT NULL,
    "precioProducto" REAL NOT NULL,
    CONSTRAINT "Precio_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Precio_idListaFk_fkey" FOREIGN KEY ("idListaFk") REFERENCES "ListaPrecios" ("idLista") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Precio" ("idListaFk", "idPrecio", "idProductoFk") SELECT "idListaFk", "idPrecio", "idProductoFk" FROM "Precio";
DROP TABLE "Precio";
ALTER TABLE "new_Precio" RENAME TO "Precio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
