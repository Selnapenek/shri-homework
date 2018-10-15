'use strict';

const express = require('express');
const router = express.Router();

const getServerTime = () => {
    const timeInSecs = Math.floor(process.uptime());
    const date = new Date(null);
    date.setSeconds(timeInSecs);
    return date.toISOString().substr(11, 8);
};

router.get('/', (req, res) => {
    res.send(getServerTime());
});

module.exports = router;

