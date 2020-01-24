const LogsService = {
    getAllLogs(knex) {
        return knex.select('*').from('logs')
    },
}

module.exports = LogsService