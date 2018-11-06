define(["require", "exports", "./dispatcher", "./store"], function (require, exports, dispatcher_1, store_1) {
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
