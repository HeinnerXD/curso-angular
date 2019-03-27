'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res) {
    var artistId = req.params.id;
    Artist.findById(artistId, (err, artist) => {
        if (err) {
            res.status(500).send({ message: 'Error al obtener el artista' });
        } else {
            if (!artist) {
                res.status(404).send({ message: 'El artista no existe' });
            } else {
                res.status(200).send({ artist });
            };
        };
    });
};

function saveArtist(req, res) {
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = null;

    artist.save((err, artistStored) => {
        if (err) {
            res.status(500).send({ message: 'Error al guardar el artista' });
        } else {
            if (!artistStored) {
                res.status(404).send({ message: 'No se pudo guardar el artista' });
            } else {
                res.status(200).send({ artist: artistStored });
            };
        };
    });
};

function getArtists(req, res) {
    if (req.params.page) {
        var page = req.params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = 3;
    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {
            if (!artists) {
                res.status(404).send({ message: 'No hay artistas' });
            } else {
                return res.status(200).send({
                    pages: total,
                    artists: artists
                });
            };
        };
    });
};

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en la peticion' });
        } else {
            if (!artistUpdated) {
                res.status(404).send({ message: 'No se pudo actualizar el artista' });
            } else {
                res.status(200).send({ artist: artistUpdated });
            };
        };
    });
};

function deleteArtist(req, res) {
    var artisId = req.params.id;
    Artist.findByIdAndRemove(artisId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error al eliminar un artista' });
        } else {
            if (!artistRemoved) {
                res.status(404).send({ message: 'No se ha podido eliminar al artista' });
            } else {
                Album.find({ artist: artistRemoved._id }).remove((err, albumRemoved) => {
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
                                            artist: artistRemoved,
                                            album: albumRemoved,
                                            song: songRemoved
                                        });
                                    };
                                };
                            });
                        };
                    };
                });
            };
        };
    });
};

function uploadImage(req, res) {
    var artisId = req.params.id;
    var fileName = 'No subido';
    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];


        if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'gif') {
            Artist.findByIdAndUpdate(artisId, { image: fileName }, (err, artistUpdated) => {
                if (!artistUpdated) {
                    res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
                } else {
                    res.status(200).send({ artist: artistUpdated });
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
    var file = './uploads/artists/' + imageFile;
    fs.exists(file, function (exist) {
        if (exist) {
            res.sendFile(path.resolve(file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    });
};

module.exports = { getArtist, saveArtist, getArtists, updateArtist, deleteArtist, uploadImage, getImageFile };