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
