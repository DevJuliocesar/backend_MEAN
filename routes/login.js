var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');

// ================================================
// Obtener todos los usuarios
// ================================================

app.post('/', (req, res) => {

    const body = req.body;
    Usuario.findOne({
        email: body.email
    }, (err, usuarioDB) => {

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
        }, 'asd', {
            expiresIn: 14400
        })

        res.status(200).json({
            ok: true,
            body: usuarioDB,
            token: token,
            id: usuarioDB._id,
        });
    })

});


module.exports = app;