define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Action {
        constructor(type = "defultAction", data = {}) {
            this.type = type;
            this.data = data;
        }
        getType() {
            return this.type;
        }
        getData() {
            return this.data;
        }
        setData(data) {
            this.data = data;
        }
    }
    exports.Action = Action;
    exports.default = Action;
});
