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

reflectionsRouter
    .route('/:id')
    .all((req, res, next) => {
        const { id } = req.params
        ReflectionsService.getById(req.app.get('db'), id)
            .then(reflection => {
                if (!reflection) {
                    return res.status(404).json({
                        error: { message: 'Reflection not found' }
                    })
                }
                res.reflection = reflection
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.reflection)
    })

module.exports = reflectionsRouter