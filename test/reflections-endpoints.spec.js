const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeReflectionsArray } = require('./reflections.fixtures')

describe('Reflections Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () =>  db.raw('TRUNCATE logs, reflections, users'))

    afterEach('clean the table', () =>  db.raw('TRUNCATE logs, reflections, users'))

    describe.only(`GET /api/reflections`, () => {
        context('Given no reflections', () => {
            it('responds with a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/reflections')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are reflections in the database', () => {
            const testUsers = makeUsersArray()
            const testReflections = makeReflectionsArray()

            beforeEach('insert reflections', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('reflections')
                            .insert(testReflections)
                    })
            })

            it('GET /api/reflections responds with 200 and all of the reflections', () => {
                return supertest(app)
                    .get('/api/reflections')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testReflections)
            })
        })
    })
})