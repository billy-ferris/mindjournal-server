const ReflectionsService = {
    getAllReflections(knex) {
        return knex.select('*').from('reflections')
    },
}

module.exports = ReflectionsService