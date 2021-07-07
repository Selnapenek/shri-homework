"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// На лекции говорилось что надо через абстрактный класс реализовывать
// ммм непонятно почему, а точнее как и зачем
class Action {
    constructor(type = "defaultAction", data = null) {
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
