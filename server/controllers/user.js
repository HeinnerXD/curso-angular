'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

function pruebas(req, res) {
    res.status(200).send({
        message: 'probando una accion del controlador de usuarios del api res con node y mongo'
    });
};

function saveUser(req, res) {
    var user = new User();
    var params = req.body;
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = params.role;
    user.image = null;

    if (params.password) {
        bcrypt.hash(params.password, null, null, function (err, hash) {
            user.password = hash;
            if (user.name != null, user.surname != null, user.email != null) {
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar el usuario' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se ha registrado el usuario' });
                        } else {
                            res.status(200).send({ user: userStored });
                        };
                    };
                });
            } else {
                res.status(200).send({ message: 'Rellena todos los datos' });
            };
        });
    } else {
        res.status(200).send({ message: 'Introduce la contraseña' });
    };
};

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe' });
            } else {
                bcrypt.compare(password, user.password, function (err, check) {
                    if (check) {
                        if (params.gethash) {
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({ user });
                        };
                    } else {
                        res.status(404).send({ message: 'El usuario no ha podido loguearse' });
                    };
                });
            };
        };
    });
};

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;
    User.findByIdAndUpdate(userId, update, (err, userUpdate) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario' });
        } else {
            if (!userUpdate) {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            } else {
                res.status(200).send({ user: userUpdate });
            };
        };
    });
};

function uploadImage(req, res) {
    var userId = req.params.id;
    var fileName = 'No subido';
    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];


        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif') {
            User.findByIdAndUpdate(userId,{image: fileName}, (err, userUpdate)=>{
                if (!userUpdate) {
                    res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                } else {
                    res.status(200).send({ user: userUpdate });
                };
            });
        }else{
            res.status(200).send({ message: 'Extension del archiivo no valida' });
        }
    } else {
        res.status(200).send({ message: 'No se ha podido subir la imagen' });
    }
};
function getImageFile(req,res){
    var imageFile = req.params.imageFile;
    var file = './uploads/users/'+ imageFile;
    fs.exists(file,  function(exist){
        if (exist) {
            res.sendFile(path.resolve(file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
};

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};