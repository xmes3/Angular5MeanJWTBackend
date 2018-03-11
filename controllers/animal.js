'use strict'

// módulos
var fs = require('fs');
var path = require('path');


// modelos
var User = require('../models/user');
var Animal = require('../models/animal');


// acciones
function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando el controlador de animales'
    })
}

function saveAnimal(req, res) {
    var animal = new Animal();
    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;

        animal.save((err, animalStored) => {
            if (err) {
                res.status(500).send({ message: 'Error en el sevidor' })
            } else {
                if (animalStored) {
                    res.status(200).send({ animal: animalStored });
                } else {
                    res.status(404).send({ message: 'No se ha guardado el animal' })
                }
            }
        });
    } else {
        res.status(200).send({ message: 'El nombre del animal es obligatorio' });
    }
}

function getAnimals(req, res) {
    Animal.find({}).populate({ path: 'user' }).exec((err, animals) => {
        if (err) {
            res.status(500).send({ message: 'Error en el sevidor' })
        } else {
            if (animals) {
                res.status(200).send({ animals: animals });
            } else {
                res.status(404).send({ message: 'No se han encontrado animales' })
            }
        }
    })
}

function getAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findById(animalId).populate({ path: 'user' }).exec((err, animal) => {
        if (err) {
            res.status(500).send({ message: 'Error en el sevidor' })
        } else {
            if (animal) {
                res.status(200).send({ animal: animal });
            } else {
                res.status(404).send({ message: 'No se ha encontrado el animal' })
            }
        }
    })
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    Animal.findByIdAndUpdate(animalId, update, { new: true }, (err, animalUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el sevidor' })
        } else {
            if (animalUpdated) {
                res.status(200).send({ animal: animalUpdated });
            } else {
                res.status(404).send({ message: 'No se ha actualizado el animal' })
            }
        }
    });
}

function uploadImage(req, res) {
    var animalId = req.params.id;
    var fileName = 'focheros no subidos';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var ext_split = file_name.split('.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            Animal.findByIdAndUpdate(animalId, { image: file_name }, { new: true }, (err, animalUpdated) => {
                if (err) {
                    res.status(500).send({ message: 'Error al actualizar el animal' });
                } else {
                    if (!animalUpdated) {
                        res.status(404).send({ message: 'No se ha podido actualizar el animal' });
                    } else {
                        res.status(200).send({ user: animalUpdated });
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
    var file_path = './uploads/animals/' + image_file_name;

    fs.exists(file_path, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(file_path));
        } else {
            res.status(404).send({ message: 'La imagen no existe' });
        }
    });
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findByIdAndRemove(animalId, (err, animalRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error en el sevidor' })
        } else {
            if (animalRemoved) {
                res.status(200).send({ animal: animalRemoved });
            } else {
                res.status(404).send({ message: 'No se ha borrado el animal' })
            }
        }
    });
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimal,
    getAnimals,
    updateAnimal,
    uploadImage,
    getImage,
    deleteAnimal
};
