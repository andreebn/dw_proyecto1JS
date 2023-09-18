const express = require('express');
const mongoose = require('mongoose');
const { purchaseModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var compra = express.Router();

compra.use(express.json());
mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')

compra.get('/', verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            purchaseModel.find({}).then(function(data){
                data.push({token: req.token})
                res.json(data)
            }).catch(function(err) {
                console.log(err)
            })
        }
    });
});

// DETALLE
compra.get('/:id', verifyToken, function (req, res) {
    const id = req.params.id;
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            purchaseModel.findById({_id: id}).then(function(data){                
                res.json(data)
            }).catch(function(err) {
                console.log(err)
            })
        }
    });
});

compra.get('/user/:user_id', verifyToken, function (req, res) {
    const user_id = req.params.user_id;
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            purchaseModel.find({id_usuario: user_id}).then(function(data){                
                res.json(data)
            }).catch(function(err) {
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

module.exports = compra