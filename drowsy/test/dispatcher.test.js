const { Dispatcher } = require('../dist/dispatcher');
const { expect } = require('chai');

describe('Dispatcher', () => { 
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

    it('should be return undefined(err) / if dispatcher has not registrated callback for action', () => {
        const action = {
            type: "defaultAction",
            data: "DATA",
            getType: () =>{ return "defaultAction";},
            getData: () => { return "DATA";}
        }

        const dispatcher = new Dispatcher();
        const result = dispatcher.dispatch(action);

        expect(result).to.be.eql(undefined);
    });

    it('should be return undefined(err) / if dispatcher has not registrated callback for action', () => {
        const cbName = "calbackName";
        const actionType = "defaultAction";
        const action = {
            type: "OtherAction",
            data: "DATA",
            getType: () =>{ return "OtherAction";},
            getData: () => { return "DATA";}
        }

        const dispatcher = new Dispatcher();
        dispatcher.callbackRegistration(cbName, actionType);
        const result = dispatcher.dispatch(action);

        expect(result).to.be.eql(undefined);
    });


});