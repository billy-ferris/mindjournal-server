const express = require('express')
const LogsService = require('./logs-service')

const logsRouter = express.Router()

logsRouter
    .route('/')
    .get((req, res, next) => {
        LogsService.getAllLogs(req.app.get('db'))
        .then(logs => {
            res.json(logs)
        })
        .catch(next)
    })

module.exports = logsRouter