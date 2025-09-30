/*
  Warnings:

  - A unique constraint covering the columns `[idCarrito,idProducto]` on the table `CarritoDetalle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CarritoDetalle_idCarrito_idProducto_key" ON "CarritoDetalle"("idCarrito", "idProducto");
