const { Store } = require('../dist/store');
const { expect } = require('chai');

describe('Store', () => { 
    it('should be return registrated callback and actiondata for action', () => {
        const cbName = "calbackName";
        const actionType = "defaultAction";
        const action = {
            type: "defaultAction",
            data: "DATA",
            getType: () =>{ return "defaultAction";},
            getData: () => { return "DATA";}
        }

        const dispatcher = new Dispatcher();
        dispatcher.callbackRegistration(cbName, actionType);
        const result = dispatcher.dispatch(action);

        expect(result).to.be.eql({ cb: cbName, actionData: action.data });
    });
});