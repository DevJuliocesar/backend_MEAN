var fs = require('fs');

var jwt = require('jsonwebtoken');

var public_key = fs.readFileSync('./keys/public.key', 'utf8');

// ================================================
// Verificar Token
// ================================================

exports.verificarToken = function (req, res, next) {
    var verifyOptions = {
        issuer: 'DevJulioCesar',
        subject: 'jcmaldonadom@ufpso.edu.co',
        audience: 'jcompany.org',
        maxAge: '24h',
        algorithms: ['RS256']
    }
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {

        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, public_key, verifyOptions,
            (err, decoded) => {

                if (err) {
                    return res.status(401).json({
                        ok: false,
                        mensaje: 'Token Incorrecto',
                        errors: err
                    });
                }

                req.usuario = decoded.usuario,
                    next();

            })
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token no pasado',
        });
    }

}