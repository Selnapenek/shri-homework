const { State } = require('../dist/state');
const { expect } = require('chai');

describe('State', () => { 
    it('should be return default object', () => {
        const defaultName = "defaultState";
        const defaultData = null;

        const state = new State();

        const stateObj = state.getState();

        expect(stateObj).to.be.eql({ stateName: defaultName, stateData: defaultData });
    });

    it('should be consist default data and custom name', () =>{
        const customName = "customName";
        const defaultData = null;

        const state = new State(customName);

        const stateObj = state.getState();

        expect(stateObj).to.be.eql({ stateName: customName, stateData: defaultData });
    });

    it('should be consist custom data and custom name', () =>{
        const customName = "customName";
        const customData = "customData: data";

        const state = new State(customName, customData);

        const stateObj = state.getState();

        expect(stateObj).to.be.eql({ stateName: customName, stateData: customData });
    });

    it('should be consist custom data after set data', () =>{
        const customName = "customName";
        const customData = "customData: data";

        const state = new State(customName);
        state.setState(customData);

        const stateObj = state.getState();

        expect(stateObj).to.be.eql({ stateName: customName, stateData: customData });
    });

});
