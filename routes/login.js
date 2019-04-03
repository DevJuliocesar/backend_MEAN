var express = require('express');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var jwt = require('jsonwebtoken');

var private_key = fs.readFileSync('./keys/private.key', 'utf8');

var app = express();

var Usuario = require('../models/usuario');

var signOptions = {
  issuer: 'DevJulioCesar',
  subject: 'jcmaldonadom@ufpso.edu.co',
  audience: 'jcompany.org',
  expiresIn: '24h',
  algorithm: 'RS256'
}

// ================================================
// Inicio de Sesión
// ================================================

app.post('/', (req, res) => {
  const body = req.body;
  Usuario.findOne({
      email: body.email
    },
    (err, usuarioDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar usuarios',
          errors: err
        });
      }

      if (!usuarioDB) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Credenciales incorrectos - email',
          errors: err
        });
      }

      if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Credenciales incorrectos - password',
          errors: err
        });
      }

      usuarioDB.password = ':)';

      var token = jwt.sign({
          usuario: usuarioDB
        },
        private_key,
        signOptions
      );

      res.status(200).json({
        ok: true,
        body: usuarioDB,
        token: token,
        id: usuarioDB._id
      });
    }
  );
});

module.exports = app;