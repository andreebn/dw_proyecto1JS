var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const usuariosSchema = new mongoose.Schema({
    nombres: String,
    apellidos: String,
    dpi: String,
    fechaNacimiento: String,
    clave: String,
    validacionClave: String,
    direccionEntrega: String,
    nit: String,
    numeroTelefonico: String,
    correoElectronico: String
})

const productoSchema = new mongoose.Schema({    
    nombre: String,
    marca: String,
    disponibilidad: Number,
    descuento: Number,
    precio: Number,
    precioDescuento: Number,
    imagen: String,
    descripcion: String,
    categorias: Object,
    habilitado: Boolean
})

const compraSchema = new mongoose.Schema({
    id_usuario: String,
    nombre_usuario: String,
    datosCarrito: Object
})

const usersModel = mongoose.model("usuarios", usuariosSchema)
const productsModel = mongoose.model("productos", productoSchema)
const purchaseModel = mongoose.model("compras", compraSchema)

module.exports = { usersModel, productsModel, purchaseModel }