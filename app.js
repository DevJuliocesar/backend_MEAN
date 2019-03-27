var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))

// parse application/json
app.use(bodyParser.json())

// Importar rutas
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuario');
let loginRoutes = require('./routes/login');

// Conexión base de datos
mongoose.connect('mongodb://localhost/hospitalDB', {
  useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
  console.log('Express server puerto 3000 online');
});