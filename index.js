'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.port || 4300;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/zoo', (err, res) => {
    if (err) {
        throw err;
    } else {
        console.log('La conexión a la base de datos zoo se ha realizado correctamente');
        app.listen(port, () => {
            console.log('El servidor local con node y express está corriendo');
        })
    }
});
