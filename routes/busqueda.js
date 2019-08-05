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
  var regex = new RegExp(busqueda, 'i');

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
  var promesa;

  switch (tabla) {
    case 'hospitales':
      promesa = buscarHospitales(busqueda, regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(busqueda, regex);
      break;
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'El tipo de busqueda no se encuentra',
        error: {
          message: 'Tipo de tabla/coleccion no válido'
        }
      });
  }

  promesa.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find(
      {
        nombre: regex
      },
      (err, hospitales) => {
        if (err) {
          reject('error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      }
    );
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find(
      {
        nombre: regex
      },
      (err, medicos) => {
        if (err) {
          reject('error al cargar los medicos', err);
        } else {
          resolve(medicos);
        }
      }
    );
  });
}

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role img')
      .or([
        {
          nombre: regex
        },
        {
          email: regex
        }
      ])
      .exec((err, usuarios) => {
        if (err) {
          reject('error al cargar los usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
