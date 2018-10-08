// Глобальные переменны состояния - для определения жеста и коордиат
const globalVars = {
    currentState: null, // Координаты x,y нажатия
    evCache: [], // Массив для определения мультитач событий
    prevDiff: -1, // Расстояние между двумя пальцами
    el: null // Элеменкт с которым будут происходить изменения
};

// Получение координат события
const setState = (ev) => {
    globalVars.currentState = {
        startX: ev.clientX,
        startY: ev.clientY
    };
};

// Расстояния между первым косанием и движением
const getDiffXY = (x, y) => {
    const {startX, startY} = globalVars.currentState;
    const dx = x - startX;
    const dy = y - startY;
    return {dx, dy};
};

// Для того что бы достать значение яркости из css фильтра
const safeParseFloat = (val) => {
    return parseFloat(isNaN(val) ? val.replace(/[^\d]+/g, '') : val);
};

// Изменение стиля элемента
const changeElemenStyle = (value, styleKey, strBefore, strAfter) => {
    const prevStyle = safeParseFloat(getComputedStyle(globalVars.el)[styleKey]);
    const newStyle = prevStyle + value;

    globalVars.el.style[styleKey] = strBefore + newStyle + strAfter;
};

// Pointer event
const pointerdownHandler = (ev) => {
    // Инициализируем состояние нажатия
    setState(ev);
    globalVars.evCache.push(ev);
    globalVars.el.setPointerCapture(ev.pointerId);
};

const pointermoveHandler = (ev) => {
    if (!globalVars.currentState) {
        return;
    }

    // Find this event in the cache and update its record with this event
    for (let i = 0; i < globalVars.evCache.length; i++) {
        if (ev.pointerId === globalVars.evCache[i].pointerId) {
            globalVars.evCache[i] = ev;
            const {dx, dy} = getDiffXY(ev.clientX, ev.clientY);
            const coefficient = 0.1;

            changeElemenStyle(dx * coefficient, 'backgroundPositionX', '', 'px');
            changeElemenStyle(dy * coefficient, 'backgroundPositionY', '', 'px');

            break;
        }
        // If two pointers are down, check for pinch gestures or rotate
        if (globalVars.evCache.length === 2) {
            // Calculate the distance and angle between the two pointers
            const curDiff = () => {
                const curDiffX = Math.abs(globalVars.evCache[0].clientX - globalVars.evCache[1].clientX);
                const curDiffY = Math.abs(globalVars.evCache[0].clientY - globalVars.evCache[1].clientY);
                Math.sqrt(Math.pow(curDiffX, 2) + Math.pow(curDiffY, 2));
            };
            const angle = () => {
                let numerator = globalVars.evCache[0].clientX * globalVars.evCache[1].clientX;
                numerator += globalVars.evCache[0].clientY * globalVars.evCache[1].clientY;
                let denominator = Math.pow(globalVars.evCache[0].clientX, 2);
                denominator += Math.pow(globalVars.evCache[0].clientY, 2);
                denominator = Math.sqrt(denominator);
                denominator *= Math.sqrt(Math.pow(globalVars.evCache[1].clientX, 2) + Math.pow(globalVars.evCache[1].clientY, 2));
                return (Math.acos(numerator / denominator) * 180) / Math.PI;
            };
            // Если пальцы уже двигались
            if (globalVars.prevDiff > 0) {
                const signDiff = curDiff > globalVars.prevDiff ? 1 : -1;
                const signAng = () => {
                    // 0 - 90, 90 - 180, 180 - 270, 270 - 360 deg
                    const leftTop = globalVars.currentState.startX > globalVars.evCache[1].clientX &&
                                    globalVars.currentState.startY < globalVars.evCache[1].clientY;
                    const rightTop = globalVars.currentState.startX > globalVars.evCache[1].clientX &&
                                     globalVars.currentState.startY > globalVars.evCache[1].clientY;
                    const rightBotoom = globalVars.currentState.startX < globalVars.evCache[1].clientX &&
                                        globalVars.currentState.startY < globalVars.evCache[1].clientY;
                    const leftBottom = globalVars.currentState.startX < globalVars.evCache[1].clientX &&
                                       globalVars.currentState.startY > globalVars.evCache[1].clientY;

                    if (leftTop || rightTop || rightBotoom || leftBottom) {
                        return -1;
                    } else {
                        return 1;
                    }
                };
                // погрешность в 15 градусов - что бы не перепутать зум и поворот
                if (angle > 15 && angle < 165) {
                    // Поворот
                    const coefficient = 0.5 * signAng;
                    changeElemenStyle(angle * coefficient, 'filter', 'brightness(', '%)');
                } else {
                    // Зум
                    const coefficient = 0.1 * signDiff;
                    changeElemenStyle(curDiff * coefficient, 'backgroundSize', '', '%');
                }
            }
            // Cache the distance for the next move event
            globalVars.prevDiff = curDiff;
            setState(ev);
        }
    }
};

const removeEvent = (ev) => {
    // Remove this event from the target's cache
    for (let i = 0; i < globalVars.evCache.length; i++) {
        if (globalVars.evCache[i].pointerId === ev.pointerId) {
            globalVars.evCache.splice(i, 1);
            break;
        }
    }
};

const stopMove = () => {
    if (!globalVars.currentState) {
        return;
    }
    globalVars.currentState = null;
};

const pointerupHandler = (ev) => {
    // If the number of pointers down is less than two then reset diff tracker
    if (globalVars.evCache.length < 2) {
        globalVars.prevDiff = -1;
    }
    removeEvent(ev);
    stopMove();
};

export default function () {
    const cam = document.querySelector('.addition__cam__img');
    globalVars.el = cam;

    cam.onpointerdown = pointerdownHandler;
    cam.onpointermove = pointermoveHandler;
    cam.onpointerup = pointerupHandler;
    cam.onpointercancel = pointerupHandler;
    cam.onpointerout = pointerupHandler;
    cam.onpointerleave = pointerupHandler;

}

