'use strict'

const events = require('./events.json');

const types = ['info', 'critical'];

module.exports = {
    dataEvents: events,
    validEventTypes: types
}