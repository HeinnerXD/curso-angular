'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;
    Song.findById(songId).populate({ path: 'album' }).exec((err, song) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición' });
        } else {
            if (!song) {
                res.status(404).send({ message: 'No existe la canción' });
            } else {
                res.status(200).send({ song });
            }
        }
    });
};

function saveSong(req, res) {
    var song = new Song();
    var params = req.body;
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;
    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'No se pudo guardar la canción' });
            } else {
                res.status(200).send({ song: songStored });
            };
        };
    });
};

function getSongs(req, res) {
    var albumId = req.params.id;
    if (!albumId) {
        var find = Song.find({}).sort('number');
    } else {
        var find = Song.find({ album: albumId }).sort('number');
    }
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songs) {
                res.status(404).send({ message: 'No hay canciones' });
            } else {
                res.status(200).send({ songs });
            };
        };
    });
};

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;
    Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songUpdated) {
                res.status(404).send({ message: 'No se pudo actualizar la cacion' });
            } else {
                res.status(200).send({ songUpdated });
            };
        };
    });
};

function deleteSong(req, res) {
    var songId = req.params.id;
    Song.findByIdAndDelete(songId, (err, songDeleted) => {
        if (err) {
            res.status(500).send({ message: 'Error en el servidor' });
        } else {
            if (!songDeleted) {
                res.status(404).send({ message: 'No se pudo borrar la cancion' });
            } else {
                res.status(200).send({ songDeleted });
            };
        };
    });
};

function uploadFile(req, res) {
    var songId = req.params.id;
    var fileName = 'No subido';
    if (req.files) {
        var filePath = req.files.file.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];


        if (fileExt == 'mp3' || fileExt == 'ogg') {
            Song.findByIdAndUpdate(songId, { file: fileName }, (err, songUpdated) => {
                if (!songUpdated) {
                    res.status(404).send({ message: 'No se ha podido actualizar el album' });
                } else {
                    res.status(200).send({ songUpdated });
                };
            });
        } else {
            res.status(200).send({ message: 'Extension del archivo no valida' });
        }
    } else {
        res.status(200).send({ message: 'No se ha podido subir la imagen' });
    }
};

function getSongFile(req, res) {
    var songFile = req.params.songFile;
    var file = './uploads/songs/' + songFile;
    fs.exists(file, function (exist) {
        if (exist) {
            res.sendFile(path.resolve(file));
        } else {
            res.status(200).send({ message: 'No existe la cancion' });
        }
    });
};


module.exports = { getSong, saveSong, getSongs, updateSong, deleteSong, uploadFile, getSongFile };