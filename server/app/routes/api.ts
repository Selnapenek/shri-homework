import * as createError from "http-errors";
import * as express from "express";

import db from "../../data";

const router : express.Router = express.Router();

// Проверка на инвалидный get параметр type
const getValidTypeEvents = (req : express.Request, res : express.Response, next : express.NextFunction) => {
    if (req.query.type) {
        if (db.validEventTypes.indexOf(req.query.type) === -1) {
            return next(createError.default(400));
        } else {
            const filteredData = db.dataEvents.events.filter((event) => {
                return event.type === req.query.type;
            });
            return res.json(filteredData);
        }
    }
    next();
};

// Пагинация событий
const eventsPagination = (page : number = 0, perPage : number = 5) => {
    // По хорошему сюда бы проверку на дурака
    const result = JSON.parse(JSON.stringify(db.dataEvents));
    result.events = result.events.splice(page * perPage, perPage);
    return result;
};

router.use('/events', getValidTypeEvents);

router.use('/events', (req : express.Request, res : express.Response, next : express.NextFunction) => {
    if (req.query.page) {
        if (req.query.perPage) {
            return res.json(eventsPagination(req.query.page, req.query.perPage));
        }
        return res.json(eventsPagination(req.query.page));
    }
    next();
});

// Отдаем все события
router.get('/events', (req : express.Request, res : express.Response) => {
    res.json(db.dataEvents);
});

router.post('/events', (req : express.Request, res : express.Response) => {
    res.json(db.dataEvents);
});

export default router;
