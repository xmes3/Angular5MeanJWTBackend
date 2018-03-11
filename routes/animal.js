'use strict'

var express = require('express');
var AnimalController = require('../controllers/animal');

var api = express.Router();
var md_auth = require('../middlewares/autenticate');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/animals' })

var md_isAdmin = require('../middlewares/isAdmin');

api.get('/pruebas-animales', md_auth.ensureAuth, AnimalController.pruebas);
api.post('/animal', [md_auth.ensureAuth, md_isAdmin.isAdmin], AnimalController.saveAnimal);
api.get('/animals', AnimalController.getAnimals);
api.get('/animal/:id', AnimalController.getAnimal);
api.put('/animal/:id',  [md_auth.ensureAuth, md_isAdmin.isAdmin], AnimalController.updateAnimal);
api.post('/upload-image-animal/:id', [md_auth.ensureAuth, md_isAdmin.isAdmin, md_upload], AnimalController.uploadImage);
api.get('/get-image-animal/:image', AnimalController.getImage);
api.delete('/animal/:id', [md_auth.ensureAuth, md_isAdmin.isAdmin], AnimalController.deleteAnimal);

module.exports = api;