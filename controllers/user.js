'use strict'

// módulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');


// modelos
var User = require('../models/user');


// servicios
var jwt = require('../services/jwt');


// acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de usuarios y la acción pruebas',
        user: req.user
    })
}

function saveUser(req, res) {

    // crear instancia de user
    var user = new User();

    // recoger los parámetros de la petición
    var params = req.body;

    // asignamos valores a user
    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.password = params.password;
        user.email = params.email;
        user.image = params.image;
        user.role = 'ROLE_USER';

        // controlamos si el email ya existe
        User.findOne({ email: user.email }, (err, userExists) => {
            if (err) {
                res.status(500).send({ message: 'Error al comprobar el usuario' });
            } else {
                if (userExists) {
                    res.status(200).send({ message: 'El usuario ya existe' });
                } else {
                    bcrypt.hash(params.password, null, null, function (err, hash) {
                        user.password = hash;

                        // Guardar user en la base de datos
                        user.save((err, userStored) => {
                            if (err) {
                                res.status(500).send({ message: 'Error al guardar el usuario' });
                            } else {
                                if (userStored) {
                                    res.status(200).send({ user: userStored });
                                } else {
                                    res.status(404).send({ message: 'No se ha registrado el usuario' });
                                }
                            }
                        });
                    });
                }
            }
        })

        // ciframos la password
    } else {
        res.status(200).send({ message: 'Los datos introducidos no son correctos' });
    }
}

function login(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error al comprobar el usuario' });
        } else {
            if (user) {
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {

                        // comprobar y generar token
                        if (params.getToken) {
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(404).send({ message: 'El usuario no se puede logear correctamente' });
                    }
                });
            } else {
                res.status(404).send({ message: 'El usuario no se puede logear' });
            }
        }
    })
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;
    delete update.password;
    
    if (userId != req.user.sub) {
        return req.status(403).send({ message: 'No tiene permiso para esta acción' });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario' });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    })
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var fileName = 'focheros no subidos';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            if (userId != req.user.sub) {
                return req.status(403).send({ message: 'No tiene permiso para esta acción' });
            }

            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar el usuario' });
                } else {
                    if (!userUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                    } else {
                        res.status(200).send({ user: userUpdated });
                    }
                }
            })
        } else {
            fs.unlink(file_path, (err) => {
                if (err) {
                    res.status(200).send({ message: 'Tipo de fichero no permitido y fichero no guardado' });
                } else {
                    res.status(200).send({ message: 'Tipo de fichero no permitido' });
                }
            });
        }
    } else {
        res.status(200).send({ message: 'No se han subido ficheros' });
    }
}

function getImage(req, res) {
    var image_file_name = req.params.image;
    var file_path = './uploads/users/' + image_file_name;

    fs.exists(file_path, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(file_path));
        } else {
            res.status(404).send({ message: 'La imagen no existe' });
        }
    });
}

function getKeepers(req, res) {
    User.find({role: 'ROLE_ADMIN'}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (users) {
                res.status(200).send({ users: users});
            } else {
                res.status(404).send({ message: 'No hay keepers' });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser,
    uploadImage,
    getImage,
    getKeepers
};

