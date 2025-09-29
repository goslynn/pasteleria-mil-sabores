/*
  Warnings:

  - The primary key for the `Producto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `referenciaProductos` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `prodDocumentId` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CarritoDetalle" (
    "idCarritoDetalle" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCarrito" INTEGER NOT NULL,
    "idProducto" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "CarritoDetalle_idCarrito_fkey" FOREIGN KEY ("idCarrito") REFERENCES "CarritoCompras" ("idCarrito") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarritoDetalle_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CarritoDetalle" ("cantidad", "idCarrito", "idCarritoDetalle", "idProducto") SELECT "cantidad", "idCarrito", "idCarritoDetalle", "idProducto" FROM "CarritoDetalle";
DROP TABLE "CarritoDetalle";
ALTER TABLE "new_CarritoDetalle" RENAME TO "CarritoDetalle";
CREATE TABLE "new_DetallePedido" (
    "idDetalle" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPedidoFk" INTEGER NOT NULL,
    "idProductoFk" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "precioUnitario" REAL NOT NULL,
    CONSTRAINT "DetallePedido_idPedidoFk_fkey" FOREIGN KEY ("idPedidoFk") REFERENCES "Pedido" ("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetallePedido_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DetallePedido" ("cantidad", "idDetalle", "idPedidoFk", "idProductoFk", "precioUnitario") SELECT "cantidad", "idDetalle", "idPedidoFk", "idProductoFk", "precioUnitario" FROM "DetallePedido";
DROP TABLE "DetallePedido";
ALTER TABLE "new_DetallePedido" RENAME TO "DetallePedido";
CREATE TABLE "new_Precio" (
    "idPrecio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idProductoFk" TEXT NOT NULL,
    "referenciaPrecio" INTEGER NOT NULL,
    CONSTRAINT "Precio_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Precio" ("idPrecio", "idProductoFk", "referenciaPrecio") SELECT "idPrecio", "idProductoFk", "referenciaPrecio" FROM "Precio";
DROP TABLE "Precio";
ALTER TABLE "new_Precio" RENAME TO "Precio";
CREATE TABLE "new_Producto" (
    "idProducto" TEXT NOT NULL PRIMARY KEY,
    "prodDocumentId" TEXT NOT NULL
);
INSERT INTO "new_Producto" ("idProducto") SELECT "idProducto" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_prodDocumentId_key" ON "Producto"("prodDocumentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
