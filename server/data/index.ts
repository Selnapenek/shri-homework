
// Весь же JSON не надо описывать?
type Event = {
    type : string,
    title : string,
    source : string,
    time : string,
    description : string | null,
    icon : string,
    data : Object | null,
    size : string
}

type Events = Event[];

type EventsJSON = {
    events : Events
};

const events : EventsJSON = require('./events.json');

const types : string[] = ['info', 'critical'];

export default {
    dataEvents: events,
    validEventTypes: types
}