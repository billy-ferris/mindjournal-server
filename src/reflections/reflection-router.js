const express = require('express')
const ReflectionsService = require('./reflection-service')
const path = require('path')

const reflectionsRouter = express.Router()

reflectionsRouter
    .route('/')
    .get((req, res, next) => {
        ReflectionsService.getAllReflections(req.app.get('db'))
        .then(reflections => {
            res.json(reflections)
        })
        .catch(next)
    })

module.exports = reflectionsRouter