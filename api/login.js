const express = require('express');
const mongoose = require('mongoose');
const { usersModel } = require('../includes/models.js');
const jwt = require('jsonwebtoken');
var login = express.Router();

login.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/proyecto1')

login.get("/", (req, res) => {
    res.json({
        message: "Nodejs y MongoDB"
    });
});

// Login User
login.post('/', function (req, res) { 
    
    const user = {        
        correoElectronico: req.body.correoElectronico,
        clave: req.body.clave
    }

    usersModel.find({correoElectronico: user.correoElectronico }).then(function(data){
        const validate = (data[0].clave == user.clave) ? true : false;
        if (validate) {
            jwt.sign({user: user}, 'secretkey', (err, token) => {
                res.json({
                    message: "Acceso existoso",
                    token: token
                })
            });   
        }
    }).catch(function(err) {
        console.log(err)
    })
});


module.exports = login