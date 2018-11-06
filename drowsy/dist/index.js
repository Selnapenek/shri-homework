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
        registrateCallback(cbName, cb, actionType) {
            this.store.addCallback(cbName, cb);
            // не диспетчер, а какой-то рудимент
            this.dispatcher.callbackRegistration(cbName, actionType);
        }
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
