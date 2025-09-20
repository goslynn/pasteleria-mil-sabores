-- CreateTable
CREATE TABLE "Usuario" (
    "idUsuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fechaNacimiento" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PreferenciasUsuario" (
    "ioPreferencia" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "diaEntrega" TEXT NOT NULL,
    "medioPago" TEXT NOT NULL,
    CONSTRAINT "PreferenciasUsuario_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarritoCompras" (
    "idCarrito" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    CONSTRAINT "CarritoCompras_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Descuento" (
    "idDescuento" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descripcion" TEXT NOT NULL,
    "porcentaje" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Producto" (
    "idProducto" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "stock" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "CarritoDetalle" (
    "idCarrito" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idProducto" INTEGER NOT NULL,
    CONSTRAINT "CarritoDetalle_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ListaPrecios" (
    "idLista" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombreLista" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Precio" (
    "idPrecio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idProductoFk" INTEGER NOT NULL,
    "idListaFk" INTEGER NOT NULL,
    CONSTRAINT "Precio_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Precio_idListaFk_fkey" FOREIGN KEY ("idListaFk") REFERENCES "ListaPrecios" ("idLista") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria" (
    "idCategoria" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ProductoCategoria" (
    "idPc" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCategoriaFK" INTEGER NOT NULL,
    "idProductoFk" INTEGER NOT NULL,
    CONSTRAINT "ProductoCategoria_idCategoriaFK_fkey" FOREIGN KEY ("idCategoriaFK") REFERENCES "Categoria" ("idCategoria") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductoCategoria_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "idPedido" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUsuarioFk" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "total" TEXT NOT NULL,
    CONSTRAINT "Pedido_idUsuarioFk_fkey" FOREIGN KEY ("idUsuarioFk") REFERENCES "Usuario" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Envio" (
    "idEnvio" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPedidoFk" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "fechaEnvio" TEXT NOT NULL,
    "estadoEnvio" TEXT NOT NULL,
    CONSTRAINT "Envio_idPedidoFk_fkey" FOREIGN KEY ("idPedidoFk") REFERENCES "Pedido" ("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "idDetalle" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPedidoFk" INTEGER NOT NULL,
    "idProductoFk" INTEGER NOT NULL,
    "cantidad" REAL NOT NULL,
    "precioUnitario" REAL NOT NULL,
    CONSTRAINT "DetallePedido_idPedidoFk_fkey" FOREIGN KEY ("idPedidoFk") REFERENCES "Pedido" ("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DetallePedido_idProductoFk_fkey" FOREIGN KEY ("idProductoFk") REFERENCES "Producto" ("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PreferenciasUsuario_idUsuarioFk_key" ON "PreferenciasUsuario"("idUsuarioFk");

-- CreateIndex
CREATE UNIQUE INDEX "CarritoCompras_idUsuarioFk_key" ON "CarritoCompras"("idUsuarioFk");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_idPedidoFk_key" ON "Envio"("idPedidoFk");

-- CreateIndex
CREATE UNIQUE INDEX "DetallePedido_idProductoFk_key" ON "DetallePedido"("idProductoFk");
