const express = require('express')
const LogsService = require('./logs-service')
const path = require('path')
const xss = require('xss')

const logsRouter = express.Router()
const jsonParser = express.json()

const serializeLog = log => ({
    id: log.id,
    content: xss(log.content),
    mood: log.mood,
    created_at: log.created_at,
    user_id: log.user_id
})

logsRouter
    .route('/')
    .get((req, res, next) => {
        LogsService.getAllLogs(req.app.get('db'))
        .then(logs => {
            res.json(logs.map(serializeLog))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { content, mood, created_at, user_id } = req.body
        const newLog = { content, mood, user_id }

        for (const [key, value] of Object.entries(newLog))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        
        newLog.created_at = created_at
        
        LogsService.insertLog(req.app.get('db'), newLog)
            .then(log => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${log.id}`))
                    .json(log)
            })
            .catch(next)
    })

logsRouter
    .route('/:id')
    .all((req, res, next) => {
        const { id } = req.params
        LogsService.getById(req.app.get('db'), id)
            .then(log => {
                if (!log) {
                    return res.status(404).json({
                        error: { message: `Log not found` }
                    })
                }
                res.log = log
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeLog(res.log))
    })

module.exports = logsRouter