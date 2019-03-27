'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res) {
    var albumId = req.params.id;
    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'Error al obtener el album' });
        } else {
            if (!album) {
                res.status(404).send({ message: 'El album no existe' });
            } else {
                res.status(200).send({ album });
            };
        };
    });
};

function saveAlbum(req, res) {
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = null;
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el album' });
        } else {
            if (!albumStored) {
                res.status(404).send({ message: 'No se pudo guardar el album' });
            } else {
                res.status(200).send({ album: albumStored });
            };
        };
    });
};

function getAlbums(req, res) {
    var artistId = req.params.artist;
    if (!artistId) {
        var find = Album.find({}).sort('title');
    } else {
        var find = Album.find({ artist: artistId }).sort('year');
    }

    find.populate({ path: 'artist' }).exec((err, albums) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' })
        } else {
            if (!albums) {
                res.status(404).send({ message: 'No hay albums' })
            } else {
                res.status(200).send({ albums })
            }
        }
    });
};

function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;
    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {
            if (!albumUpdated) {
                res.status(404).send({ message: 'No se pudo actualizar el album' });
            } else {
                res.status(200).send({ albumUpdated });
            };
        };
    });
};

function deleteAlbum(req, res){
    var albumId = req.params.id;
    Album.findByIdAndRemove(albumId , (err, albumRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error al eliminar el album' });
        } else {
            if (!albumRemoved) {
                res.status(404).send({ message: 'No se pudo eliminar el albun' });
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al eliminar la cancion' });
                    } else {
                        if (!songRemoved) {
                            res.status(404).send({ message: 'No se pudo eliminar la cancion' });
                        } else {
                            res.status(200).send({
                                album: albumRemoved
                            });
                        };
                    };
                });
            };
        };
    });
}

function uploadImage(req, res) {
    var albumId = req.params.id;
    var fileName = 'No subido';
    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];


        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif') {
            Album.findByIdAndUpdate(albumId, { image: fileName }, (err, albumUpdated) => {
                if (!albumUpdated) {
                    res.status(404).send({ message: 'No se ha podido actualizar el album' });
                } else {
                    res.status(200).send({ album: albumUpdated });
                };
            });
        } else {
            res.status(200).send({ message: 'Extension del archiivo no valida' });
        }
    } else {
        res.status(200).send({ message: 'No se ha podido subir la imagen' });
    }
};

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var file = './uploads/albums/' + imageFile;
    fs.exists(file, function (exist) {
        if (exist) {
            res.sendFile(path.resolve(file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
};

module.exports = { getAlbum, saveAlbum, getAlbums, updateAlbum, deleteAlbum, uploadImage, getImageFile };