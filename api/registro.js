const express = require('express');
const mongoose = require('mongoose');
const { usersModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var registro = express.Router();

registro.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')


registro.get("/", (req, res) => {
    res.json({
        message: "Registro"
    });
});

registro.post('/:dpi', function (req, res) {

    const user = {
        nombres: req.body.nombres,
        apellidos: req.body.apellidos,
        dpi: req.params.dpi,
        fechaNacimiento: req.body.fechaNacimiento,
        clave: req.body.clave,
        validacionClave: req.body.validacionClave,
        nit: req.body.nit,
        numeroTelefonico: req.body.numeroTelefonico,
        correoElectronico: req.body.correoElectronico,
    }

    usersModel.exists({ correoElectronico: user.correoElectronico }).then(function (data) {
        if (data) {
            res.json({
                data: data,
                message: "Este correo ya está asociado a una cuenta"
            })
        } else {
            usersModel.create(user)
            .then(res.json({ message: "Usuario registrado" }))
            .catch(err => res.json(err))
        }        
    }).catch(function (err) {
        console.log(err)
    })
});

module.exports = registro