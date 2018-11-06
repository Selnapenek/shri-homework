import { ActionData } from "./action";
import { ViewName } from "./index";
import { State, StateData, StateName } from "./state";

export type CallbackName = string;
export type Callback = (args: ActionData) => void;

export class Store {

    private stateStore: Map<StateName, State>;
    private storage: Storage;
    private callbackMap: Map<CallbackName, Callback>;
    private viewSubscribers: Map<ViewName, StateName[]>;

    constructor() {
        this.storage = window.localStorage;
        const localValue: string | null = this.storage.getItem("drowsy");

        if (localValue) {
            this.stateStore = new Map(JSON.parse(localValue));
        } else {
            this.stateStore = new Map();
        }

        this.callbackMap = new Map();
        this.viewSubscribers = new Map();
    }

    public setState(stateName: StateName, stateData: StateData) {
        let curState = this.stateStore.get(stateName);
        curState = new State(stateName, stateData);
        this.stateStore.set(stateName, curState);

        const serialObj = JSON.stringify([...this.stateStore]);
        this.storage.setItem("drowsy", serialObj);
    }

    public getState(stateName: StateName) {
        return this.stateStore.get(stateName);
    }

    public getAll() {
        return this.stateStore;
    }

    public sendCallback(cbName: CallbackName) {
        const cb: Callback | undefined = this.callbackMap.get(cbName);
        if (cb) {
            return cb;
        } else {
            throw Error();
        }
    }

    public addCallback(cbName: CallbackName, cb: Callback) {
        this.callbackMap.set(cbName, cb);
    }

    public mutate(cbName: CallbackName, args: ActionData) {
        const prevStateStore = new Map(this.stateStore);
        this.doCallback(cbName, args);
        // почему-то кажется что вся обертка над cb лишняя и что можно получать новые данные в конце cb
        const newStateStore = this.stateStore;

        const updatedStateArray = new Array();

        newStateStore.forEach((state: State, stateName: StateName) => {
            if (prevStateStore.get(stateName) !== state) {
                updatedStateArray.push(stateName);
            }
        });

        const dataForUpdateView = new Map<ViewName, State[]>();
        // ммм, тоже такое себе..., так еще на уровне выше повторяется...
        this.viewSubscribers.forEach( (states: StateName[], viewName: ViewName) => {
            const data = new Array(); // ммм, с массивом, ну такое себе

            updatedStateArray.forEach( (updatedState: StateName) => {
                let stateData: State | undefined;

                if ( states.indexOf(updatedState) >= 0) {
                    stateData = this.getState(updatedState);
                    if (stateData) {
                        data.push(stateData);
                    } else {
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
    public subscribe(viewName: ViewName, stateName: StateName) {
        const stateListened = this.viewSubscribers.get(viewName);
        if (stateListened) {
            stateListened.push(stateName);
        } else {
            const newStateListened = new Array();
            newStateListened.push(stateName);
            this.viewSubscribers.set(viewName, newStateListened);
        }
    }

    private doCallback(cbName: CallbackName, args: ActionData) {
        const cb = this.callbackMap.get(cbName);
        if (cb) {
            cb(args);
        } else {
            // trow Error
        }
    }

}
