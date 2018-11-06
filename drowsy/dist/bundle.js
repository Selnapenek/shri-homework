define("action", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // На лекции говорилось что надо через абстрактный класс реализовывать
    // ммм непонятно почему, а точнее как и зачем
    class Action {
        constructor(type = "defultAction", data = null) {
            this.type = type;
            this.data = data;
        }
        getType() {
            return this.type;
        }
        getData() {
            return this.data;
        }
        setData(data) {
            this.data = data;
        }
    }
    exports.Action = Action;
    exports.default = Action;
});
define("state", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class State {
        constructor(stateName = "defaultState", stateData = null) {
            this.stateName = stateName;
            this.stateData = stateData;
        }
        setState(stateData) {
            this.stateData = stateData;
        }
        getState() {
            const stateName = this.stateName;
            const stateData = this.stateData;
            return { stateName, stateData };
        }
    }
    exports.State = State;
});
define("store", ["require", "exports", "state"], function (require, exports, state_1) {
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
define("dispatcher", ["require", "exports"], function (require, exports) {
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
});
define("view", ["require", "exports", "action"], function (require, exports, action_1) {
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
        createAction(actionType, actionData = null) {
            const newAction = new action_1.Action(actionType, actionData);
            this.actionMap.set(actionType, newAction);
            return newAction;
        }
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
});
define("index", ["require", "exports", "dispatcher", "store"], function (require, exports, dispatcher_1, store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Drowsy {
        constructor() {
            this.store = new store_1.Store();
            this.dispatcher = new dispatcher_1.Dispatcher();
            this.viewMap = new Map();
        }
        addView(viewName, view) {
            this.viewMap.set(viewName, view);
        }
        updateView(viewName, data) {
            const view = this.viewMap.get(viewName);
            if (view) {
                view.update(data);
            }
            else {
                // trow Error,
            }
        }
        addActionToView(actionType, viewName) {
            const view = this.viewMap.get(viewName);
            if (view) {
                view.createAction(actionType);
            }
            else {
                // trow Error,
            }
        }
        addActionArrayToView(actionTypes, viewName) {
            const view = this.viewMap.get(viewName);
            if (view) {
                actionTypes.forEach((actionType) => {
                    view.createAction(actionType);
                });
            }
            else {
                // trow Error,
            }
        }
        registrateCallback(cbName, cb, actionType) {
            this.store.addCallback(cbName, cb);
            // Если По схеме которая была представленна на лекции:
            // const callBack = this.store.sendCallback(cbName)
            // this.dispatcher.callbackRegistration(callBack, actionType); (надо будет перегрузить метод)
            // А потом получать обратно этот же callback и выполнить его (store.doCallback(callback, ...))?
            // В чем смысл туда сюда гонять этото колбек?
            // не диспетчер, а какой-то рудимент
            this.dispatcher.callbackRegistration(cbName, actionType);
        }
        // TODO: Если надо много зарегестрировать много экшинов на один колбек +- и на оборот
        // public registrateMapOfCallbacks(callBackMap: Map<CallbackName, Callback>,
        //                                 actionTypeMap: Map<ActionType, CallbackName>) {
        //     this.store.addCallback(cbName, cb);
        //     this.dispatcher.callbackRegistration(cbName, actionType);
        // }
        doAction(actionType, viewName, data) {
            const view = this.viewMap.get(viewName);
            let action;
            if (view) {
                action = view.getAction(actionType);
                if (action) {
                    action.setData(data);
                    // ммм, какая-то бессцыслица в dispatcher'e
                    const storeCollbackAndArgs = this.dispatcher.dispatch(action);
                    if (storeCollbackAndArgs) {
                        const storeCbName = storeCollbackAndArgs.cb;
                        const cbArg = storeCollbackAndArgs.actionData;
                        this.store.mutate(storeCbName, cbArg);
                    }
                    else {
                        // trow Error
                    }
                }
                else {
                    // trow Error
                }
            }
            else {
                // trow Error
            }
        }
    }
    exports.Drowsy = Drowsy;
});
