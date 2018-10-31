import * as express from 'express';

const router : express.Router = express.Router();

const getServerTime = () => {
    const timeInSecs : number = Math.floor(process.uptime());
    const date : Date = new Date(0);
    date.setSeconds(timeInSecs);
    return date.toISOString().substr(11, 8);
};

router.get('/', (req : express.Request, res : express.Response) => {
    res.send(getServerTime());
});

router.post('/', (req : express.Request, res : express.Response) => {
    res.send(getServerTime());
});

export default router;

