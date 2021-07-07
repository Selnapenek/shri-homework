export type ActionType = string;
export type ActionData = string | number | object | boolean | null;

// На лекции говорилось что надо через абстрактный класс реализовывать
// ммм непонятно почему, а точнее как и зачем

export class Action {
    private type: ActionType;
    private data: ActionData;

    constructor(type: ActionType = "defaultAction", data: ActionData = null) {
        this.type = type;
        this.data = data;
    }

    public getType() {
        return this.type;
    }

    public getData() {
        return this.data;
    }

    public setData(data: ActionData) {
        this.data = data;
    }
}

export default Action;
