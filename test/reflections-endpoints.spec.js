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
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () =>  db.raw('TRUNCATE logs, reflections, users'))

    afterEach('clean the table', () =>  db.raw('TRUNCATE logs, reflections, users'))

    describe(`GET /api/reflections`, () => {
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

    describe(`GET /api/reflections`, () => {
        context('Given no reflections', () => {
            it('responds with a 404', () => {
                const id = 12345
                return supertest(app)
                    .get(`/api/reflections/${id}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {
                        error: { message: 'Reflection not found' }
                    })
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

            it('responds with a 200 and the reflection with id', () => {
                const idToGet = 2
                const expectedReflection = testReflections[idToGet - 1]

                return supertest(app)
                    .get(`/api/reflections/${idToGet}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedReflection)
            })
        })

        describe(`POST /api/reflections`, () => {
            const testUsers = makeUsersArray()

            beforeEach('insert user', () => {
                return db
                    .into('users')
                    .insert(testUsers)
            })

            it('creates a log, responding with 201 and the enw log', () => {
                const newReflection = {
                    title: 'My POST Reflection Test',
                    content: 'This is my test content for POST',
                    user_id: 1
                }
                return supertest(app)
                    .post('/api/reflections')
                    .send(newReflection)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.title).to.eql(newReflection.title)
                        expect(res.body.content).to.eql(newReflection.content)
                        expect(res.body.user_id).to.eql(newReflection.user_id)
                        expect(res.body).to.have.property('id')
                        expect(res.header.location).to.eql(`/api/reflections/${res.body.id}`)
                        const expected = new Date().toLocaleDateString()
                        const actual = new Date(res.body.last_edited).toLocaleDateString()
                        expect(actual).to.eql(expected)
                    })
                    .then(postRes => 
                        supertest(app)
                            .get(`/api/reflections/${postRes.body.id}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(postRes.body)
                    )
            })

            const requiredFields = ['title', 'content', 'user_id']

            requiredFields.forEach(field => {
                const newReflection = {
                    title: 'My POST Reflection Test',
                    content: 'This is my test content for POST',
                    user_id: 1
                }

                it('responds with 400 and an error when the field is missing', () => {
                    delete newReflection[field]

                    return supertest(app)
                        .post('/api/reflections')
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .send(newReflection)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body` }
                        })
                })
            })
        })

        describe(`DELETE /api/reflections/:id`, () => {
            context('Given no reflections', () => {
                it('responds with a 404', () => {
                    const id = 12345
                    return supertest(app)
                        .get(`/api/reflections/${id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(404, {
                            error: { message: 'Reflection not found' }
                        })
                })
            })
    
            context('Given there are reflections in the database', () => {
                const testUsers = makeUsersArray()
                const testReflections = makeReflectionsArray()

                beforeEach('insert logs', () => {
                    return db
                        .into('users')
                        .insert(testUsers)
                        .then(() => {
                            return db
                                .into('reflections')
                                .insert(testReflections)
                        })
                })

                it('responds with a 204 and removes the log', () => {
                    const idToDelete = 2
                    const expectedReflections = testReflections.filter(reflection => reflection.id !== idToDelete)

                    return supertest(app)
                        .delete(`/api/reflections/${idToDelete}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(204)
                        .then(res => 
                            supertest(app)
                                .get('/api/reflections')
                                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                                .expect(expectedReflections)
                        )
                })
            })
        })
    })
})