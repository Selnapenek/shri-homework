import { Action, ActionData } from "./action";
import { ActionType } from "./action";
import { CallbackName } from "./store";

export class Dispatcher {
    private callbackMap: Map<ActionType, CallbackName>;

    constructor() {
        this.callbackMap = new Map();
    }

    public callbackRegistration(cbName: CallbackName, actionType: ActionType) {
        this.callbackMap.set(actionType, cbName);
    }

    public dispatch(action: Action) {
        const cb: CallbackName | undefined = this.callbackMap.get(action.getType());
        const actionData: ActionData = action.getData();
        if (cb) {
            return {cb, actionData};
        } else {
            // trow error
        }
    }
}
