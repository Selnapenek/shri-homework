'use strict';

const createError = require('http-errors');
const db = require('../../data');
const express = require('express');

const router = express.Router();

// Проверка на инвалидный get параметр type
const getValidTypeEvents = (req, res, next) => {
    if (req.query.type) {
        if (db.validEventTypes.indexOf(req.query.type) === -1) {
            return next(createError(400, 'Incorrect type'));
        } else {
            const filteredData = db.dataEvents.events.filter((event) => {
                return event.type === req.query.type;
            });
            return res.json(filteredData);
        }
    }
    next();
}

router.use('/events', getValidTypeEvents);

router.get('/events', (req, res) => {
    res.json(db.dataEvents);
});

router.post('/events', (req, res) => {
    res.json(db.dataEvents);
});

module.exports = router;
