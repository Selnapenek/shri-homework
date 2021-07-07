"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./action");
class View {
    constructor(data = new Array()) {
        this.data = data;
        this.actionMap = new Map();
    }
    update(data) {
        this.data = data;
    }
    createAction(actionType, actionData = null) {
        const newAction = new action_1.Action(actionType, actionData);
        this.actionMap.set(actionType, newAction);
        return newAction;
    }
    // Это наверное лишнее
    updateAction(actionType, actionData) {
        const action = this.actionMap.get(actionType);
        if (action) {
            action.setData(actionData);
        }
        else {
            // trow Error
        }
    }
    getAction(key) {
        return this.actionMap.get(key);
    }
}
exports.View = View;
