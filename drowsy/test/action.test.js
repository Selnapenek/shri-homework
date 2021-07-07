const { Action } = require('../dist/action');
const { expect } = require('chai');

describe('Action', () => { 
    it('should be return default object', () => {
        const defaultType = "defaultAction";
        const defaultData = null;

        const action = new Action();

        const type = action.getType();
        const data = action.getData();

        expect({type, data}).to.be.eql({ type: defaultType, data: defaultData });
    });

    it('should be consist default data and custom type', () =>{
        const customType = "customType";
        const defaultData = null;

        const action = new Action(customType);

        const type = action.getType();
        const data = action.getData();

        expect({type, data}).to.be.eql({ type: customType, data: defaultData });
    });

    it('should be consist custom data after set data', () =>{
        const customData = 'customData';

        const action = new Action();

        action.setData(customData);
        const data = action.getData();

        expect(data).to.be.eql(customData);
    });

});
