const ReflectionsService = {
    getAllReflections(knex) {
        return knex.select('*').from('reflections')
    },
    getById(knex, id) {
        return knex.select('*').from('reflections').where('id', id).first()
    },
}

module.exports = ReflectionsService