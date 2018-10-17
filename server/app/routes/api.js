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

// Пагинация событий
const eventsPagination = (page = 0, perPage = 5) => {
    const result = JSON.parse(JSON.stringify(db.dataEvents));
    result.events = result.events.splice(page * perPage, perPage);
    return result;
}

router.use('/events', getValidTypeEvents);

router.use('/events', (req, res, next) => {
    if (req.query.page) {
        if (req.query.perPage) {
            return res.json(eventsPagination(req.query.page, req.query.perPage));
        }
        return res.json(eventsPagination(req.query.page));
    }
    next();
});

// Отдаем все события
router.get('/events', (req, res) => {
    res.json(db.dataEvents);
});

router.post('/events', (req, res) => {
    res.json(db.dataEvents);
});

module.exports = router;
