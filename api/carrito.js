const express = require('express');
const mongoose = require('mongoose');
const { usersModel, productsModel, purchaseModel } = require('../includes/models.js');
var all_cart = require('../includes/items.js');
const jwt = require('jsonwebtoken');
const cart_products = [];
var cart_total = 0;

var carrito = express.Router();

carrito.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')


carrito.get('/', verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            res.json(all_cart);
        }
    });
});



carrito.post('/', verifyToken, function (req, res) {

    const cart = {
        _id: req.body.id,
        cantidad: req.body.cantidad,
    }

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            productsModel.findById({ _id: cart._id }).then(function (product) {
                if (product.habilitado) {
                    if (product.disponibilidad >= cart.cantidad) {
                        cart_products.push({
                            _id: product._id,
                            nombre: product.nombre,
                            marca: product.marca,
                            disponibilidad: (product.disponibilidad - cart.cantidad),
                            descuento: product.descuento,
                            precio: product.precio,
                            precioDescuento: product.precioDescuento,
                            imagen: product.imagen,
                            descripcion: product.descripcion,
                            cantidad: cart.cantidad,
                            total: (product.precioDescuento * cart.cantidad)
                        });

                        cart_total = cart_total + (product.precioDescuento * cart.cantidad)
                        const dataUpdateProduct = {
                            disponibilidad: (product.disponibilidad - cart.cantidad),
                            habilitado: false
                        }
                        productsModel.findByIdAndUpdate({ _id: cart._id }, dataUpdateProduct)
                            .catch(err => res.json(err))
                        all_cart = {
                            productos: cart_products,
                            total: cart_total
                        }
                        res.json({
                            mesage: "Producto agregado"
                        })
                    } else {
                        res.json({
                            message: "Producto sin existencias",
                            disponibilidad: product.disponibilidad,
                            nombre: product.nombre,
                            id: product._id
                        })
                    }
                } else {
                    res.json({
                        message: "Producto no disponible",
                        nombre: product.nombre,
                        id: product._id
                    })
                }
            }).catch(function (err) {
                console.log(err)
            })
        }
    });
});


carrito.put('/:id', verifyToken, function (req, res) {
    const cart = {
        _id: req.params.id,
        cantidad: req.body.cantidad,
    }
    var nuevaCantidad = 0;
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            const objIndex = cart_products.findIndex((obj => obj._id == cart._id));
            if (cart.cantidad < cart_products[objIndex].cantidad) {

                nuevaCantidad = cart_products[objIndex].cantidad - cart.cantidad;
                cart_products[objIndex].disponibilidad = cart_products[objIndex].disponibilidad + nuevaCantidad;
                cart_total = cart_total - (cart_products[objIndex].precioDescuento * nuevaCantidad)
            } else {

                nuevaCantidad = cart.cantidad - cart_products[objIndex].cantidad;
                cart_products[objIndex].disponibilidad = cart_products[objIndex].disponibilidad - nuevaCantidad;
                cart_total = cart_total + (cart_products[objIndex].precioDescuento * nuevaCantidad)
            }
            cart_products[objIndex].cantidad = cart.cantidad;
            cart_products[objIndex].total = cart_products[objIndex].precioDescuento * cart.cantidad;

            const dataUpdateProduct = {
                disponibilidad: cart_products[objIndex].disponibilidad
            }
            productsModel.findByIdAndUpdate({ _id: cart._id }, dataUpdateProduct)
                .catch(err => res.json(err))

            all_cart = {
                productos: cart_products,
                total: cart_total
            }
            res.json(all_cart);
        }
    });
})

carrito.delete('/:id', verifyToken, function (req, res) {
    const id = req.params.id;

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            const product = cart_products.find(p => p._id == id);

            if (!product) return res.status(402).json({ message: 'Producto no encontrado' });

            const objIndex = cart_products.findIndex((obj => obj._id == id));
            const updatedDisponibilidad = cart_products[objIndex].disponibilidad + cart_products[objIndex].cantidad;
            cart_total = cart_total - cart_products[objIndex].total;

            const dataUpdateProduct = {
                disponibilidad: updatedDisponibilidad,
                habilitado: true
            }
            productsModel.findByIdAndUpdate({ _id: id }, dataUpdateProduct)
                .catch(err => res.json(err))

            cart_products.splice(objIndex, 1);

            all_cart = {
                productos: cart_products,
                total: cart_total
            }

            res.json({ success: 'Se eliminó el producto ' + id + ' del carrito' });
        }
    });
});

// MOSTRAR CARRITO
carrito.post('/compra', verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {

            usersModel.find({ correoElectronico: authData.user.correoElectronico }).then(function (data) {
                const validate = (data[0].clave == authData.user.clave) ? true : false;
                if (validate) {
                    
                    const dataCartPurchase = {
                        id_usuario: data[0]._id,
                        nombre_usuario: data[0].nombres + " " + data[0].apellidos,
                        datosCarrito: all_cart
                    }

                    purchaseModel.create(dataCartPurchase)
                        .then(() => {
                            all_cart.productos.map((element) => {
                                productsModel.findByIdAndUpdate({ _id: element._id }, {habilitado: true})
                                    .then(res.json({ message: "Compra realizada", info: dataCartPurchase }))
                                    .catch(err => res.json(err))
                            })
                        })
                        .catch(err => res.json(err))
                }
            }).catch(function (err) {
                console.log(err)
            })
        }
    });
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = carrito