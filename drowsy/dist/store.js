define(["require", "exports", "./state"], function (require, exports, state_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Store {
        constructor() {
            this.storage = window.localStorage;
            const localValue = this.storage.getItem("drowsy");
            if (localValue) {
                this.stateStore = JSON.parse(localValue);
            }
            else {
                this.stateStore = new Map();
            }
            this.callbackMap = new Map();
            this.viewSubscribers = new Map();
        }
        setState(stateName, stateData) {
            let curState = this.stateStore.get(stateName);
            if (curState) {
                curState.setState(stateData);
            }
            else {
                curState = new state_1.State(stateName, stateData);
                this.stateStore.set(stateName, curState);
            }
            const serialObj = JSON.stringify(this.stateStore);
            this.storage.setItem("drowsy", serialObj);
        }
        getState(stateName) {
            return this.stateStore.get(stateName);
        }
        getAll() {
            return this.stateStore;
        }
        sendCallback(cbName) {
            const cb = this.callbackMap.get(cbName);
            if (cb) {
                return cb;
            }
            else {
                throw Error();
            }
        }
        addCallback(cbName, cb) {
            this.callbackMap.set(cbName, cb);
        }
        mutate(cbName, args) {
            const prevStateStore = this.stateStore;
            this.doCallback(cbName, args);
            // почему-то кажется что вся обертка над cb лишняя и что можно получать новые данные в конце cb
            const newStateStore = this.stateStore;
            const updatedStateArray = new Array();
            newStateStore.forEach((state, stateName) => {
                if (prevStateStore.get(stateName) !== state) {
                    updatedStateArray.push(stateName);
                }
            });
            const dataForUpdateView = new Map();
            // ммм, тоже такое себе..., так еще на уровне выше повторяется...
            this.viewSubscribers.forEach((states, viewName) => {
                const data = new Array(); // ммм, с массивом, ну такое себе
                updatedStateArray.forEach((updatedState) => {
                    let stateData;
                    if (states.indexOf(updatedState) >= 0) {
                        stateData = this.getState(updatedState);
                        if (stateData) {
                            data.push(stateData);
                        }
                        else {
                            // trow Error
                        }
                    }
                });
                if (data.length) {
                    dataForUpdateView.set(viewName, data);
                }
            });
            return dataForUpdateView;
        }
        // наверное все эти вещи с подпиской и мутацией лучше было сделать через события
        subscribe(viewName, stateName) {
            const stateListened = this.viewSubscribers.get(viewName);
            if (stateListened) {
                stateListened.push(stateName);
            }
            else {
                const newStateListened = new Array();
                newStateListened.push(stateName);
                this.viewSubscribers.set(viewName, newStateListened);
            }
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
