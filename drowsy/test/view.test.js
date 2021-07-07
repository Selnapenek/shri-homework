const { View } = require('../dist/view');
const { expect } = require('chai');

describe('View', () => { 
    describe('method createAction', () => { 
        it('should be return default action', () => {
            const defaultActionType = "defaultAction";
            const defaultActionData = null;
            const defaultAction = {
                type: defaultActionType,
                data: defaultActionData
            }
    
            const view = new View();
           
            const action =  view.createAction();
    
            expect(action).to.be.eql(defaultAction);
        });
    
        it('should be return custom action with defaultData', () => {
            const customActionType = "customActionType";
            const defaultActionData = null;
            const defaultAction = {
                type: customActionType,
                data: defaultActionData
            };
    
            const view = new View();
           
            const action =  view.createAction(customActionType);
    
            expect(action).to.be.eql(defaultAction);
        });
    
        it('should be return custom action', () => {
            const customActionType = "customActionType";
            const customActionData = "customActionData";
            const customAction = {
                type: customActionType,
                data: customActionData
            };
    
            const view = new View();
           
            const action =  view.createAction(customActionType, customActionData);
    
            expect(action).to.be.eql(customAction);
        });
    
    });

    describe('method getAction', () => { 

        it('should be return undefined if createAction has not argument', () => {
            const defaultActionType = "defaultAction";
            const view = new View();
           
            view.createAction();
            const action = view.getAction(defaultActionType);
    
            expect(action).to.be.eql(undefined);
        });
    
        it('should be return custom action with defaultData', () => {
            const customActionType = "customActionType";
            const defaultActionData = null;
            const defaultAction = {
                type: customActionType,
                data: defaultActionData
            };
            const view = new View();
            
            view.createAction(customActionType);
            const action = view.getAction(customActionType);

            expect(action).to.be.eql(defaultAction);
        });

        it('should be return custom action', () => {
            const customActionType = "customActionType";
            const customActionData = "customActionData";
            const customAction = {
                type: customActionType,
                data: customActionData
            };
            const view = new View();
           
            view.createAction(customActionType, customActionData);
            const action = view.getAction(customActionType);
    
            expect(action).to.be.eql(customAction);
        });

    });

    // describe('method update', () => {
    // });
    // ммм стоит, ли проверять view.data?
});
