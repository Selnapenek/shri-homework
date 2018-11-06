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
define("view", ["require", "exports", "action"], function (require, exports, action_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        doAction(actionType, viewName, data = null) {
            const view = this.viewMap.get(viewName);
            let action;
            if (view) {
                action = view.getAction(actionType);
                if (action) {
                    if (data) {
                        action.setData(data);
                    }
                    // ммм, какая-то бессцыслица в dispatcher'e
                    const storeCollbackAndArgs = this.dispatcher.dispatch(action);
                    if (storeCollbackAndArgs) {
                        const storeCbName = storeCollbackAndArgs.cb;
                        const cbArg = storeCollbackAndArgs.actionData;
                        const dataForUpdateView = this.store.mutate(storeCbName, cbArg);
                        dataForUpdateView.forEach((d, v) => {
                            this.updateView(v, d);
                        });
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
