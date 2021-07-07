import { Action, ActionData } from "./action";
import { ActionType } from "./action";
import { Store } from "./Store";

export class View {
    private data: object[];
    private actionMap: Map<ActionType, Action>;

    constructor(data: object[] = new Array()) {
        this.data = data;
        this.actionMap = new Map();
    }

    public update(data: object[]) {
        this.data = data;
    }

    public createAction(actionType: ActionType, actionData: ActionData = null) {
        const newAction: Action =  new Action(actionType, actionData);
        this.actionMap.set(actionType, newAction);
        return newAction;
    }

    // Это наверное лишнее
    public updateAction(actionType: ActionType, actionData: ActionData) {
        const action: Action | undefined = this.actionMap.get(actionType);
        if (action) {
            action.setData(actionData);
        } else {
            // trow Error
        }
    }

    public getAction(key: ActionType) {
        return this.actionMap.get(key);
    }
}
