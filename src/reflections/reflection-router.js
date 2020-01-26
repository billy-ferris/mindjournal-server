const express = require('express')
const ReflectionsService = require('./reflection-service')
const path = require('path')

const reflectionsRouter = express.Router()
const jsonParser = express.json()

reflectionsRouter
    .route('/')
    .get((req, res, next) => {
        ReflectionsService.getAllReflections(req.app.get('db'))
        .then(reflections => {
            res.json(reflections)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, content, last_edited, user_id } = req.body
        const newReflection = { title, content, user_id }

        for (const [key, value] of Object.entries(newReflection))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newReflection.last_edited = last_edited

        ReflectionsService.insertReflection(req.app.get('db'), newReflection)
                .then(reflection => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${reflection.id}`))
                        .json(reflection)
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
    .delete((req, res, next) => {
        const { id } = req.params
        ReflectionsService.deleteReflection(req.app.get('db'), id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = reflectionsRouter