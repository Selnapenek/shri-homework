import { Action, ActionData, ActionType } from "./action";
import { Dispatcher } from "./dispatcher";
import { State } from "./state";
import { Callback, CallbackName,  Store } from "./store";
import { View } from "./view";

export type ViewName = string;

export class Drowsy {
    private store: Store;
    private dispatcher: Dispatcher;
    private viewMap: Map<ViewName, View>;

    constructor() {
        this.store = new Store();
        this.dispatcher = new Dispatcher();
        this.viewMap = new Map();
    }

    public addView(viewName: ViewName, view: View) {
        this.viewMap.set(viewName, view);
    }

    public updateView(viewName: string, data: object[]) {
        const view = this.viewMap.get(viewName);
        if (view) {
            view.update(data);
        } else {
            // trow Error,
        }
    }

    public addActionToView(actionType: ActionType, viewName: string) {
        const view = this.viewMap.get(viewName);
        if (view) {
            view.createAction(actionType);
        } else {
            // trow Error,
        }
    }

    public addActionArrayToView(actionTypes: ActionType[], viewName: string) {
        const view = this.viewMap.get(viewName);
        if (view) {
            actionTypes.forEach((actionType: ActionType) => {
                view.createAction(actionType);
            });
        } else {
            // trow Error,
        }
    }

    public registrateCallback(cbName: CallbackName, cb: Callback, actionType: ActionType ) {
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

    public doAction(actionType: string, viewName: string, data: ActionData = null) {
        const view = this.viewMap.get(viewName);
        let action: Action | undefined;
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
                    dataForUpdateView.forEach( (d: State[], v: ViewName) => {
                        this.updateView(v, d);
                    });
                } else {
                    // trow Error
                }
            } else {
                // trow Error
            }
        } else {
            // trow Error
        }
    }

}
