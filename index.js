const express = require('express');
const app = express();
const port = 3000;

const registro = require('./api/registro');
const login = require('./api/login');
const perfil = require('./api/perfil');
const productos = require('./api/productos');
const producto = require('./api/producto');
const carrito = require('./api/carrito');
const compra = require('./api/compra');

app.use('/api/registro', registro);
app.use('/api/login', login);
app.use('/api/perfil', perfil);
app.use('/api/productos', productos);
app.use('/api/producto', producto);
app.use('/api/carrito', carrito);
app.use('/api/compra', compra);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});