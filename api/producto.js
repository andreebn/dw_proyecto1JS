const express = require('express');
const mongoose = require('mongoose');
const { productsModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var producto = express.Router();

producto.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')

producto.get('/:id', verifyToken, function (req, res) {
    const id = req.params.id;
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.setHeader("code", 401)
            res.sendStatus(403);
        } else {
            productsModel.findById({_id: id}).then(function(data){                
                res.json(data)
            }).catch(function(err) {
                console.log(err)
            })
        }
    });
});

producto.put('/:id', verifyToken, function (req, res) {    
    const id = req.params.id;
    const dataProduct = {
        nombre: req.body.nombre,
        marca: req.body.marca,
        disponibilidad: req.body.disponibilidad,
        descuento: req.body.descuento,
        precioDescuento: req.body.precioDescuento,
        imagen: req.body.imagen,
        descripcion: req.body.descripcion,
        categorias: req.body.categorias

    };
    // res.json(dataUser)
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.setHeader("code", 401)
            res.sendStatus(403);
        } else {
            productsModel.findByIdAndUpdate({_id: id}, dataProduct)
            .then(data => res.json({message: "Registro actualizado" , id: data._id}))
            .catch(err => res.json(err))
        }
    });    
});

producto.delete('/:id', verifyToken, function (req, res) {    
    const id = req.params.id;

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.setHeader("code", 401)
            res.sendStatus(403);
        } else {
            productsModel.findByIdAndDelete({_id: id})
            .then(res.json({message: "Producto eliminado."}))
            .catch(err => res.json(err))
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

module.exports = producto