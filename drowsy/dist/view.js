define(["require", "exports", "./action"], function (require, exports, action_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class View {
        constructor(data = {}) {
            this.data = data;
            this.actionMap = new Map();
        }
        update(data) {
            this.data = data;
        }
        subscribe(store) {
            return null;
        }
        createAction(actionType) {
            const newAction = new action_1.Action(actionType);
            this.actionMap.set(actionType, newAction);
            return newAction;
        }
        getAction(key) {
            return this.actionMap.get(key);
        }
    }
    exports.View = View;
});
