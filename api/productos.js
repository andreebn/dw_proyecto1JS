const express = require('express');
const mongoose = require('mongoose');
const { productsModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var productos = express.Router();

productos.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')

productos.post('/', verifyToken, function (req, res) {

    const products = {
        nombre: req.body.nombre,
        marca: req.body.marca,
        disponibilidad: req.body.disponibilidad,
        descuento: req.body.descuento,
        precio: req.body.precio,
        precioDescuento: (req.body.precio - req.body.descuento),
        imagen: req.body.imagen,
        descripcion: req.body.descripcion,
        categorias: req.body.categorias,
        habilitado: true
    }

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            productsModel.exists({ nombre: products.nombre }).then(function (data) {
                if (data) {
                    res.setHeader("code", 401)
                    res.json({
                        data: data,
                        message: "Producto existente"
                    })
                } else {
                    productsModel.create(products)
                    .then(() => {
                        res.setHeader("code", 200)
                        res.json({ message: "Producto registrado" })
                    })
                    .catch(err => res.json(err))
                }        
            }).catch(function (err) {
                console.log(err)
            })
        }
    });      
});

// Get data
productos.get('/', verifyToken, function (req, res) {

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            productsModel.find({}).then(function(data){
                data.push({token: req.token})
                res.json(data)
            }).catch(function(err) {
                console.log(err)
            })
        }
    });

    
});


// Authorization: Bearer <token>
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

module.exports = productos