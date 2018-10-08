var logEvents = true;

    // Logging/debugging functions
    function enableLog(ev) {
    logEvents = logEvents ? false : true;
    }

    function log(prefix, ev) {
        if (!logEvents) return;
        let o = document.getElementsByTagName('output')[0];
        let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        let s;
        if(iOS){
            s = prefix + ' ' + ev;
        }else{
            s = prefix + ": pointerID = " + ev.pointerId +
                        " ; pointerType = " + ev.pointerType +
                        " ; isPrimary = " + ev.isPrimary;
        }
        o.innerHTML += "<div><p>" + s + "</p></div>";

    } 

    function clearLog(event) {
        var o = document.getElementsByTagName('output')[0];
        o.innerHTML = "";
    }

    const start = document.querySelector('#log');
    start.onclick=enableLog;
    const clear = document.querySelector('#clearlog');
    clear.onclick=clearLog;


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
const safeParseInt = (val) => {
    return parseInt(isNaN(val) ? val.replace(/[^-\d]\.+/g, '') : val);
};

// Изменение стиля элемента
const changeElemenStyle = (value, styleKey, strBefore, strAfter) => {
    const prevStyle = safeParseInt(getComputedStyle(globalVars.el)[styleKey]);
    const newStyle = prevStyle + parseInt(value);
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
        // TODO: Интерполировать tochevents на pointerevents
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

function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < globalVars.evCache.length; i++) {
      let id =  globalVars.evCache[i].identifier;
      
      if (id == idToFind) {
        return i;
      }
    }
    return -1;    // not found
}

// Что-бы без лишних данных было событие
function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY,
             clientX: touch.clientX, clientY:touch.clientY,
             rotationAngle: touch.rotationAngle
            };
}

// Toch events TODO: привести к общему типу/много повторяющегося кода
const touchstartHandler = (ev) => {
    ev.preventDefault();
    setState(ev);

    let touches = ev.touches;
    for (let i = 0; i < touches.length; i++) {
        globalVars.evCache.push(copyTouch(touches[i]));
    }
}

const touchmoveHandler = (ev) => {
    ev.preventDefault();
    let touches = ev.touches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            if (touches.length === 1) {
                const startX = globalVars.evCache[idx].clientX;
                const startY = globalVars.evCache[idx].clientY;
                const dx = touches[i].clientX - startX;
                const dy = touches[i].clientY - startY;
                const coefficient = 1;

                changeElemenStyle(dx * coefficient, 'backgroundPositionX', '', 'px');
                changeElemenStyle(dy * coefficient, 'backgroundPositionY', '', 'px');
            } else if (touches.length === 2) {
                let point1=-1, point2=-1;
                for (let i=0; i < globalVars.evCache.length; i++) {
                  if (globalVars.evCache[i].identifier == ev.touches[0].identifier) point1 = i;
                  if (globalVars.evCache[i].identifier == ev.touches[1].identifier) point2 = i;
                }

                if (point1 >=0 && point2 >= 0) {
                
                    // Calculate the difference between the start and move coordinates
                    const diff1X = Math.abs(globalVars.evCache[point1].clientX - ev.touches[0].clientX);
                    const diff1Y = Math.abs(globalVars.evCache[point1].clientY - ev.touches[0].clientY);

                    const prevDiff = Math.abs(globalVars.evCache[point1].clientX - globalVars.evCache[point2].clientX );
                    const curDiff = Math.abs(ev.touches[0].clientX - ev.touches[1].clientX );;

                    // This threshold is device dependent as well as application specific
                    const PINCH_THRESHHOLD_X = ev.target.clientWidth / 35;
                    const pinchX = diff1X >= PINCH_THRESHHOLD_X && diff2X >= PINCH_THRESHHOLD_X;

                    const rotate = 0;

                    // TODO: маштабировать по диагонали, а не только по ширине
                    if (pinchX) {
                        const signDiff = curDiff > prevDiff ? 1 : -1;
                        const coefficient = signDiff * (0.2);
                        changeElemenStyle( coefficient * (diff1X), 'backgroundSize', '', '%');
                    }

                    // TODO:
                    /* if(rotate) {

                    } */
                }

            }
            globalVars.evCache.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        } 
    }
};

const touchendHandler = (ev) => {
    ev.preventDefault();
    let touches = ev.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
    
        if (idx >= 0) {
            globalVars.evCache.splice(idx, 1);  // remove it; we're done
        }
      }
};

export default function () {
    const cam = document.querySelector('.addition__cam__img');
    globalVars.el = cam;

    let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // PEP не работат по iOS
    if (iOS) {
        cam.ontouchstart = touchstartHandler;
        cam.ontouchmove = touchmoveHandler;
        cam.ontouchend = touchendHandler;
        cam.ontouchend = touchendHandler;
    } else {
        cam.onpointerdown = pointerdownHandler;
        cam.onpointermove = pointermoveHandler;
        cam.onpointerup = pointerupHandler;
        cam.onpointercancel = pointerupHandler;
        cam.onpointerout = pointerupHandler;
        cam.onpointerleave = pointerupHandler;
    }

}

