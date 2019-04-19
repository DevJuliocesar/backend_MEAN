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
  audience: 'devjuliocesar.com',
  expiresIn: '24h',
  algorithm: 'RS256'
}

/* Google Library */
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {
  OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    payload: payload,
    google: true
  }
}

/* 
================================================
  Inicio de Sesión Google
================================================ 
*/
app.post('/google', async (req, res) => {
  var token = req.body.token;
  let flagsErros = false;

  var googleUser = await verify(token).catch(e => flagsErros = true);

  if (flagsErros) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token No valido',
      error: 'Error google token no valido'
    });
  }

  Usuario.findOne({
    email: googleUser.email
  }, (err, usuarioDB) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuarios',
        errors: err
      });
    }

    if (usuarioDB) {

      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe usar su autenticación normal',
        });
      } else {
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

    } else {

      // El usuario no existe, hay que crearlo 

      var usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = 'T?v%kFNB+X4D';

      usuario.save((err, usuarioDB) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error al guardar usuarios',
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

      })
    }
  });

})

/* 
================================================
  Inicio de Sesión
================================================ 
*/
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