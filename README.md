# MindJournal

> All-in-one journal for individuals

With MindJournal, users can jot down their experiences, situations and lessons and associate them with a certain emotion that describes how they felt in that moment. Users can filter by specific emotions or search entries and better map out their journey by using their previous journals to help better their future however they please.

Live App Link: https://mindjournal.now.sh/
Client Repository Link: https://github.com/baf62495/mindjournal-client

![Logs List With Filters](/screenshots/logs-with-filter.png)

![Main Reflections List](/screenshots/reflections-list.png)

# API Documentation

GET /api/logs - Gets all logs

GET /api/logs/:id - Get log by id

POST /api/logs - Creates new log

DELETE /api/logs/:id - Deletes log with id

GET /api/reflections - Gets all reflections

GET /api/reflections/:id - Get reflection by id

POST /api/reflections - Creates new reflection

DELETE /api/reflections/:id - Deletes reflection with id

# Technology Used

- React
- Node/Express
- PostgreSQL
