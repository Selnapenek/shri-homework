export type StateName = string;
export type StateData = object | string | number | null ;

export class State {
    private stateName: StateName;
    private stateData: StateData;

    constructor(stateName: StateName = "defaultState", stateData: StateData = null) {
        this.stateName = stateName;
        this.stateData = stateData;
    }

    public setState(stateData: StateData) {
        this.stateData = stateData;
    }

    public getState() {
        const stateName = this.stateName;
        const stateData = this.stateData;
        return {stateName, stateData};
    }
}
