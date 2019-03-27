'use strict'

var express = require('express');
var artistController = require('../controllers/artist');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/artists' });

api.get('/artist/:id', md_auth.ensureAuth, artistController.getArtist);
api.post('/artist', md_auth.ensureAuth, artistController.saveArtist);
api.get('/artists/:page?', md_auth.ensureAuth, artistController.getArtists);
api.put('/artist/:id', md_auth.ensureAuth, artistController.updateArtist);
api.delete('/artist/:id', md_auth.ensureAuth, artistController.deleteArtist);
api.post('/uploadImageArtist/:id', [md_auth.ensureAuth, md_upload], artistController.uploadImage);
api.get('/getImageArtist/:imageFile', artistController.getImageFile);

module.exports = api;