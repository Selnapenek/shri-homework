define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class State {
        constructor(stateName = "defaultState", stateData = {}) {
            this.stateName = stateName;
            this.stateData = stateData;
        }
        setState(stateName, stateData) {
            this.stateName = stateName;
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
