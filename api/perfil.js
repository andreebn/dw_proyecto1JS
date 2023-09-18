const express = require('express');
const mongoose = require('mongoose');
const { usersModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var perfil = express.Router();
 
perfil.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')

perfil.get('/:dpi', verifyToken, function (req, res) {
    const dpi = req.params.dpi;
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            usersModel.findOne({dpi: dpi}).then(function(data){                
                res.json(data)
            }).catch(function(err) {
                console.log(err)
            })
        }
    });
});

perfil.put('/:dpi', verifyToken, function (req, res) {    
    const dpi = req.params.dpi;
    const dataUser = {
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        dpi: dpi,
        fechaNacimiento: req.body.fechaNacimiento,
        clave: req.body.clave,
        validacionClave: req.body.validacionClave,
        direccionEntrega: req.body.direccionEntrega,
        nit: req.body.nit,
        numeroTelefonico: req.body.numeroTelefonico,
        correoElectronico: req.body.correoElectronico

    };
    // res.json(dataUser)
    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            usersModel.findOneAndUpdate({dpi: dpi}, dataUser)
            .then(data => res.json({message: "Registro Actualizado" , dpi: data.dpi}))
            .catch(err => res.json(err))
        }
    });    
});

perfil.delete('/:dpi', verifyToken, function (req, res) {    
    const dpi = req.params.dpi;

    jwt.verify(req.token, 'secretkey', (error, authData) => {
        if (error) {
            res.sendStatus(403);
        } else {
            usersModel.findOneAndDelete({dpi: dpi})
            .then(res.json({message: "Usuario eliminado."}))
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

module.exports = perfil
