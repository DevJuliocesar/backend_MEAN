var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =======================================
// Busqueda General
// =======================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i')

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    });
});

// =======================================
// Busqueda por colección
// =======================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    if (tabla === 'hospitales') {
        buscarHospitales(busqueda, regex).then(hospitales => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
            });
        })
    } else if (tabla === 'medicos') {
        buscarMedicos(busqueda, regex).then(medicos => {
            res.status(200).json({
                ok: true,
                medicos: medicos,
            });
        })
    } else if (tabla === 'usuarios') {
        buscarMedicos(busqueda, regex).then(usuarios => {
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
            });
        })
    } else {
        res.status(500).json({
            ok: false,
            msg: 'no existe',
        });
    }

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({
            nombre: regex
        }, (err, hospitales) => {
            if (err) {
                reject('error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }

        });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({
            nombre: regex
        }, (err, medicos) => {
            if (err) {
                reject('error al cargar los medicos', err);
            } else {
                resolve(medicos);
            }

        });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img').or([{
            'nombre': regex
        }, {
            'email': regex
        }]).exec((err, usuarios) => {
            if (err) {
                reject('error al cargar los usuarios', err);
            } else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;