var express = require('express');

var mdAuth = require('../middlewares/autentication')

var app = express();

var Medico = require('../models/medico');

// ================================================
// Obtener todos los medicos
// ================================================

app.get('/', (req, res, next) => {

    var skip = Number(req.query.skip) || 0;

    Medico.find()
        .skip(skip)
        .limit(10)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.countDocuments((err, count) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: count
                });
            });

        })

});

// ================================================
// Actualizar medico
// ================================================

app.put('/:id', mdAuth.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findOneAndUpdate({
        _id: id
    }, {
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    }, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con el id ${id} no existe`,
                errors: {
                    message: 'No existe un médico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medico
        });
    })

});

// ================================================
// Crear un nuevo medico
// ================================================

app.post('/', mdAuth.verificarToken, (req, res) => {

    const body = req.body;

    const medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital,
        img: body.img
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });

});

// ================================================
// Borrar un medico
// ================================================

app.delete('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El médico con el id ${id} no existe`,
                errors: {
                    message: 'No existe un médico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    });
});


module.exports = app;