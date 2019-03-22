var express = require('express');
var mongoose = require('mongoose');

var app = express();

// Conexión base de datos
mongoose.connect('mongodb://localhost/hospitalDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're conected!")
    // we're connected!
});

app.get('/', (req, res, next) => {
    res.status(403).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

app.listen(3000, () => {
    console.log('Express server puerto 3000 online');
});