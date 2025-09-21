/*
  Warnings:

  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListaPrecios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductoCategoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `descripcion` on the `Descuento` table. All the data in the column will be lost.
  - You are about to drop the column `porcentaje` on the `Descuento` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Envio` table. All the data in the column will be lost.
  - You are about to drop the column `idListaFk` on the `Precio` table. All the data in the column will be lost.
  - You are about to drop the column `precioProducto` on the `Precio` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `imgURL` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Producto` table. All the data in the column will be lost.
  - Added the required column `referencia` to the `Descuento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idDireccionFk` to the `Envio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenciaPrecio` to the `Precio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenciaProductos` to the `Producto` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Categoria";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ListaPrecios";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductoCategoria";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Pais" (
    "idPais" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Region" (
    "idRegion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "idPaisFk" INTEGER NOT NULL,
    CONSTRAINT "Region_idPaisFk_fkey" FOREIGN KEY ("idPaisFk") REFERENCES "Pais" ("idPais") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comuna" (
    "idComuna" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "idRegionFk" INTEGER NOT NULL,
    CONSTRAINT "Comuna_idRegionFk_fkey" FOREIGN KEY ("idRegionFk") REFERENCES "Region" ("idRegion") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Direccion" (
    "idDireccion" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "calle" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "departamento" TEXT,
    "idComunaFk" INTEGER NOT NULL,
    "usuarioIdUsuario" INTEGER,
    CONSTRAINT "Direccion_idComunaFk_fkey" FOREIGN KEY ("idComunaFk") REFERENCES "Comuna" ("idComuna") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Direccion_usuarioIdUsuario_fkey" FOREIGN KEY ("usuarioIdUsuario") REFERENCES "Usuario" ("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Descuento" (
    "idDescuento" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referencia" INTEGER NOT NULL
);
INSERT INTO "new_Descuento" ("idDescuento") SELECT "idDescuento" FROM "Descuento";
DROP TABLE "Descuento";
ALTER TABLE "new_Descuento" RENAME TO "Descuento";
CREATE TABLE "new_Envio" (
    "idEnvio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPedidoFk" INTEGER NOT NULL,
    "idDireccionFk" INTEGER NOT NULL,
    "fechaEnvio" TEXT NOT NULL,
    "estadoEnvio" TEXT NOT NULL,
    CONSTRAINT "Envio_idPedidoFk_fkey" FOREIGN KEY ("idPedidoFk") REFERENCES "Pedido" ("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Envio_idDireccionFk_fkey" FOREIGN KEY ("idDireccionFk") REFERENCES "Direccion" ("idDireccion") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Envio" ("estadoEnvio", "fechaEnvio", "idEnvio", "idPedidoFk") SELECT "estadoEnvio", "fechaEnvio", "idEnvio", "idPedidoFk" FROM "Envio";
DROP TABLE "Envio";
ALTER TABLE "new_Envio" RENAME TO "Envio";
CREATE UNIQUE INDEX "Envio_idPedidoFk_key" ON "Envio"("idPedidoFk");
CREATE TABLE "new_Precio" (
    "idPrecio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idProductoFk" INTEGER NOT NULL,
    "referenciaPrecio" INTEGER NOT NULL,
    CONSTRAINT "Precio_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Precio" ("idPrecio", "idProductoFk") SELECT "idPrecio", "idProductoFk" FROM "Precio";
DROP TABLE "Precio";
ALTER TABLE "new_Precio" RENAME TO "Precio";
CREATE TABLE "new_Producto" (
    "idProducto" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenciaProductos" INTEGER NOT NULL
);
INSERT INTO "new_Producto" ("idProducto") SELECT "idProducto" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Pais_nombre_key" ON "Pais"("nombre");
