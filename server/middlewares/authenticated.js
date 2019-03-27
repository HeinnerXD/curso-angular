'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
var secret = 'clavee-secreta-curso';

exports.ensureAuth = function(req, res, next){
    if (!req.headers.authorization) {
        return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticación.'})
    }
    var token = req.headers.authorization.replace(/[´"]+/g,''); //reemplaza las comillas simples y comillas dobles por un espacio vacio
    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment.unix()) {
            return  res.status(401).send({message: 'El token ha expirado'})
        }
    } catch (ex) {
        return res.status(404).send({message: 'Token no valido'})
    }
    req.user = payload;
    next();

};