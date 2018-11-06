"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Dispatcher {
    constructor() {
        this.callbackMap = new Map();
    }
    callbackRegistration(cbName, actionType) {
        this.callbackMap.set(actionType, cbName);
    }
    dispatch(action) {
        const cb = this.callbackMap.get(action.getType());
        const actionData = action.getData();
        if (cb) {
            return { cb, actionData };
        }
        else {
            // trow error
        }
    }
}
exports.Dispatcher = Dispatcher;
