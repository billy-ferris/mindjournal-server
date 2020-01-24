process.env.TZ = 'UTC'
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeLogsArray } = require('./logs.fixtures')

describe.only('Logs Endpoints', function() {
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

    describe(`GET /api/logs`, () => {
        context('Given no logs', () => {
            it('responds with a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/logs')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are logs in the database', () => {
            const testUsers = makeUsersArray()
            const testLogs = makeLogsArray()

            beforeEach('insert logs', () => {
                return db
                    .into('users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('logs')
                            .insert(testLogs)
                    })
            })

            it('GET /api/logs responds with 200 and all of the logs', () => {
                return supertest(app)
                    .get('/api/logs')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testLogs)
            })
        })
    })
})