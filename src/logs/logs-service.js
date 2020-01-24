const LogsService = {
    getAllLogs(knex) {
        return knex.select('*').from('logs')
    },
    getById(knex, id) {
        return knex.select('*').from('logs').where('id', id).first()
    },
    insertLog(knex, newLog) {
        return knex
            .insert(newLog)
            .into('logs')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteLog(knex, id) {
        return knex('logs')
            .where({ id })
            .delete()
    }
}

module.exports = LogsService