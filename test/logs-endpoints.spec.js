process.env.TZ = 'UTC'
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeLogsArray } = require('./logs.fixtures')

describe('Logs Endpoints', function() {
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

    describe(`GET /api/logs/:id`, () => {
        context('Given no logs', () => {
            it('responds with a 404', () => {
                const id = 12345
                return supertest(app)
                    .get(`/api/logs/${id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {
                        error: { message: 'Log not found' }
                    })
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

            it('responds with a 200 and the log with id', () => {
                const idToGet = 2
                const expectedLog = testLogs[idToGet - 1]

                return supertest(app)
                    .get(`/api/logs/${idToGet}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedLog)
            })
        })
    })

    describe(`POST /api/logs`, () => {
        const testUsers = makeUsersArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('creates a log, responding with 201 and the new log', () => {
            const newLog = {
                content: 'Testing log entry',
                mood: 'Neutral',
                user_id: 1
            }
            return supertest(app)
                .post('/api/logs')
                .send(newLog)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(201)
                .expect(res => {
                    expect(res.body.content).to.eql(newLog.content)
                    expect(res.body.mood).to.eql(newLog.mood)
                    expect(res.body.user_id).to.eql(newLog.user_id)
                    expect(res.body).to.have.property('id')
                    expect(res.header.location).to.eql(`/api/logs/${res.body.id}`)
                    const expected = new Date().toLocaleDateString()
                    const actual = new Date(res.body.created_at).toLocaleDateString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/logs/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)
                )
        })

        const requiredFields = ['content', 'mood', 'user_id']

        requiredFields.forEach(field => {
            const newLog = {
                content: 'POST test log',
                mood: 'Neutral',
                user_id: 1
            }

            it('responds with 400 and an error when the field is missing', () => {
                delete newLog[field]

                return supertest(app)
                    .post('/api/logs')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(newLog)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`DELETE /api/logs/:id`, () => {
        context('Given no logs', () => {
            it('responds with 404', () => {
                const id = 12345
                return supertest(app)
                    .delete(`/api/logs/${id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {
                        error: { message: 'Log not found' }
                    })
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

            it('responds with 204 and removes the log', () => {
                const idToDelete = 2
                const expectedLogs = testLogs.filter(log => log.id !== idToDelete)

                return supertest(app)
                    .delete(`/api/logs/${idToDelete}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/logs')
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedLogs)
                    )
            })
        })
    })
})