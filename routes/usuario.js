var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/autentication')

var app = express();

var Usuario = require('../models/usuario');

// ================================================
// Obtener todos los usuarios
// ================================================

app.get('/', (req, res, next) => {

  var skip = Number(req.query.skip) || 0;

  Usuario.find({}, 'nombre email role img')
    .sort({
      role: 1
    })
    .skip(skip)
    .limit(10)
    .exec(
      (err, usuarios) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando usuarios',
            errors: err
          });
        }

        Usuario.count((err, count) => {
          res.status(200).json({
            ok: true,
            usuarios: usuarios,
            total: count
          });

        })
      })

});

// ================================================
// Actualizar usuario
// ================================================

app.put('/:id', mdAuth.verificarToken, (req, res) => {

  var id = req.params.id;
  var body = req.body;

  Usuario.findOneAndUpdate({
    _id: id
  }, {
    nombre: body.nombre,
    email: body.email
  }, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al actualizar usuario',
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id ${id} no existe`,
        errors: {
          message: 'No existe un usuario con ese ID'
        }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuario
    });
  })

});

// ================================================
// Crear un nuevo usuario
// ================================================

app.post('/', mdAuth.verificarToken, (req, res) => {

  const body = req.body;

  const usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear usuario',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });

});

// ================================================
// Borrar un usuario
// ================================================

app.delete('/:id', mdAuth.verificarToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar usuario',
        errors: err
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id ${id} no existe`,
        errors: {
          message: 'No existe un usuario con ese ID'
        }
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    })
  });
});


module.exports = app;