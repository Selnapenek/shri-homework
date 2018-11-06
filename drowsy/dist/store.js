define(["require", "exports", "./state"], function (require, exports, state_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Store {
        constructor() {
            this.storage = window.localStorage;
            const localValue = this.storage.getItem("drowsy");
            if (localValue) {
                this.state = JSON.parse(localValue);
            }
            else {
                this.state = new state_1.State();
            }
            this.callbackMap = new Map();
        }
        setState(stateName, stateData) {
            this.state = new state_1.State(stateName, stateData);
            const serialObj = JSON.stringify(this.state);
            this.storage.setItem("drowsy", serialObj);
        }
        getState() {
            return this.state;
        }
        sendCallback(cbName) {
            const cb = this.callbackMap.get(cbName);
            return cb;
        }
        addCallback(cbName, cb) {
            this.callbackMap.set(cbName, cb);
        }
        mutate(cbName, args) {
            this.doCallback(cbName, args);
        }
        doCallback(cbName, args) {
            const cb = this.callbackMap.get(cbName);
            if (cb) {
                cb(args);
            }
            else {
                // trow Error
            }
        }
    }
    exports.Store = Store;
});
