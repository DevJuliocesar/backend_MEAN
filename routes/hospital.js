var express = require('express');

var mdAuth = require('../middlewares/autentication')

var app = express();

var Hospital = require('../models/hospital');

// ================================================
// Obtener todos los hospitales
// ================================================

app.get('/', (req, res, next) => {

    var skip = Number(req.query.skip) || 0;

    Hospital.find()
        .skip(skip)
        .limit(10)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.countDocuments((err, count) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: count
                    });
                });


            })

});

// ================================================
// Actualizar hospital
// ================================================

app.put('/:id', mdAuth.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findOneAndUpdate({
        _id: id
    }, {
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    }, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    })

});

// ================================================
// Crear un nuevo hospital
// ================================================

app.post('/', mdAuth.verificarToken, (req, res) => {

    const body = req.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
        img: body.img
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });

});

// ================================================
// Borrar un hospital
// ================================================

app.delete('/:id', mdAuth.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    });
});


module.exports = app;