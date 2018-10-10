// Log events flag
let logEvents = true;

// Logging/debugging functions
function enableLog() {
    logEvents = logEvents ? false : true;
}

function log(prefix) {
    if (!logEvents) {
        return;
    }
    let o = document.getElementsByTagName('output')[0];
    let s = prefix;
    o.innerHTML += '<div>' + s + '<div>';
}

function clearLog(event) {
    let o = document.getElementsByTagName('output')[0];
    o.innerHTML = '';
}

const start = document.querySelector('#log');
start.onclick = enableLog;
const clear = document.querySelector('#clearlog');
clear.onclick = clearLog;

// Глобальные переменны состояния - для определения жеста и коордиат
const globalVars = {
    currentState: null, // Координаты x,y нажатия
    evCache: [], // Массив для определения мультитач событий
    prevDiff: -1, // Расстояние между двумя пальцами
    el: null, // Элеменкт с которым будут происходить изменения
    elLimit: { // Ограничения css свойств элемента
        MaxWidth: 0,
        MinWidth: 0,
        MaxHeight: 0,
        MinHeight: 0,
        offsetX: 0,
        offsetY: 0
    }
};

// Получение координат события
const setState = (ev) => {
    globalVars.currentState = {
        startX: ev.x,
        startY: ev.y,
        clientX: ev.clientX,
        clientY: ev.clientY
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
    return parseInt(isNaN(val) ? val.replace(/[^-\d]\.+/g, '') : val, 10);
};

// Округление до 2 знака
const roundFloat = (number) => {
    // return parseFloat(number.toFixed(2));
    return Math.round(number * 100) / 100;
};

/**
 * Изменение css стиля элемента
 * @param {number} value
 * @param {string} styleKey
 * @param {string} strBefore
 * @param {string} strAfter
 * @param {Array(2)} limitationMinMax - ограничения, limitationMinMax[0] - min, limitationMinMax[1] - max
 */
const changeElemenStyle = (el, value, styleKey, strBefore, strAfter, ...limitationMinMax) => {
    if (styleKey === 'transform') {
        return;
    }

    const prevStyle = safeParseInt(getComputedStyle(el)[styleKey]);
    let newStyle = prevStyle + parseInt(value, 10);
    // Ограничение на стилевые параметры

    if (limitationMinMax.length === 2) {
        newStyle = newStyle < limitationMinMax[0] ? limitationMinMax[0] : newStyle;
        newStyle = newStyle > limitationMinMax[1] ? limitationMinMax[1] : newStyle;
    }
    el.style[styleKey] = strBefore + newStyle + strAfter;
};

/** Получим transform: matrix в виде массива
 * @param {int} el - ДОМ узел у которого надо достать матрицу transform
 *  @return {string} - matrix[index]
 */
const getTransformMatrix = (el) => {
    let transform = [...getComputedStyle(el).transform.replace(/,/g, '')];
    let indexToDel = transform.indexOf(')');
    // delete ')'
    transform.splice(indexToDel, 1);
    // delete 'matrix('
    transform.splice(0, 7);
    let matrixArray = transform.join('').split(' ');
    return matrixArray;
};

/**
 * Изменение css свойства transform элемента
 * @param {DOMNode} el - ДОМ узел стиль которого надо изменить
 * @param {Array(6)} value - martix(...)
 * @param {Array(2)(6)} limitationMinMax - limitationMinMax[0][...] - min, limitationMinMax[1][...] - max,  , если элемент = NaN - ограничения нет
 * навреное как-то по другому надо было ограничение принимать
 */
const changeElementTransform = (el, value, limitationMinMax) => {
    const matrix = getTransformMatrix(el);
    const newValue = matrix.map( (item, index) => {
        if ( isNaN( limitationMinMax[0][index] ) && isNaN( limitationMinMax[1][index] ) ) {
            return roundFloat( parseFloat( item ) + value[index] );
        } else if ( parseFloat( item ) + value[index] < limitationMinMax[0][index] ) {
            return roundFloat( limitationMinMax[0][index] );
        } else if ( parseFloat( item ) + value[index] > limitationMinMax[1][index] ) {
            return roundFloat( limitationMinMax[1][index] );
        } else {
            return roundFloat( parseFloat(item) + value[index] );
        }
    }).join(', ');
    el.style.transform = 'matrix(' + newValue + ')';
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

    // Передвижение фона
    // ПРЕДУПРЕЖДЕНИЕ: поддерживаются только простые перемещения (по горизонтали/вертикали/диагонали)
    // по сложной тракетории движения пальца отрабатывается не корректно
    if (globalVars.evCache.length === 1) {

        const {dx, dy} = getDiffXY(ev.clientX, ev.clientY);
        const coefficient = 0.1;

        const scale = getTransformMatrix(globalVars.el)[0];
        const limits = globalVars.elLimit;
        const limitX = ev.target.clientWidth * scale - limits.offsetX;
        const limitY = ev.target.clientHeight * scale - limits.offsetY;

        const martix = [0, 0, 0, 0, dx * coefficient, dy * coefficient];
        const limit = [
            [NaN, NaN, NaN, NaN, -1 * limitX, -1 * limitY],
            [NaN, NaN, NaN, NaN, 0, 0]
        ];
        changeElementTransform(globalVars.el, martix, limit);
    }

    // Find this event in the cache and update its record with this event
    for (let i = 0; i < globalVars.evCache.length; i++) {
        if (ev.pointerId === globalVars.evCache[i].pointerId) {
            globalVars.evCache[i] = ev;
            break;
        }
        // If two pointers are down, check for pinch gestures or rotate
        if (globalVars.evCache.length === 2) {
            // Calculate the distance and angle between the two pointers
            const curDiffX = Math.abs(globalVars.evCache[0].clientX - globalVars.evCache[1].clientX);
            const curDiffY = Math.abs(globalVars.evCache[0].clientY - globalVars.evCache[1].clientY);
            const curDiff = Math.sqrt(Math.pow(curDiffX, 2) + Math.pow(curDiffY, 2));

            let numerator = globalVars.evCache[0].clientX * globalVars.evCache[1].clientX;
            numerator += globalVars.evCache[0].clientY * globalVars.evCache[1].clientY;
            let denominator = Math.pow(globalVars.evCache[0].clientX, 2);
            denominator += Math.pow(globalVars.evCache[0].clientY, 2);
            denominator = Math.sqrt(denominator);
            denominator *= Math.sqrt(Math.pow(globalVars.evCache[1].clientX, 2) + Math.pow(globalVars.evCache[1].clientY, 2));
            const angle = Math.acos( (numerator / denominator) ) * 180 / Math.PI;
            // Если пальцы уже двигались
            if (globalVars.prevDiff > 0) {
                const signDiff = curDiff > globalVars.prevDiff ? 1 : -1;
                /* const signAng = () => {
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
                }; */

                const PINCH_THRESHHOLD = Math.sqrt(Math.pow(ev.target.clientWidth, 2) + Math.pow(ev.target.clientHeight, 2)) / 15;
                const pinch = curDiff / 2 >= PINCH_THRESHHOLD;

                if (pinch) {
                    // Зум
                    const martix = [0.1 * signDiff, 0, 0, 0.1 * signDiff, 0, 0];
                    const limit = [
                        [0.6, NaN, NaN, 0.6, NaN, NaN],
                        [2, NaN, NaN, 2, 0, 0]
                    ];
                    changeElementTransform(globalVars.el, martix, limit);

                    const scale = getTransformMatrix(globalVars.el)[0];
                    const limits = globalVars.elLimit;
                    const limitX = ev.target.clientWidth * scale - limits.offsetX;
                    const limitY = ev.target.clientHeight * scale - limits.offsetY;

                    // Что бы при зумировании не происходило сдвига
                    const martixClr = [0, 0, 0, 0, 0, 0];
                    const limitClr = [
                        [NaN, NaN, NaN, NaN, -1 * limitX, -1 * limitY],
                        [NaN, NaN, NaN, NaN, 0, 0]
                    ];
                    changeElementTransform(globalVars.el, martixClr, limitClr);
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
    const camContainer = document.querySelector('.addition__cam');
    const zommValue = document.querySelector('.addition__cam__zoom .addition__optional__value');
    globalVars.el = cam;
    // При ресайзе пользовательского окна надо будет обновлять эти параметры
    globalVars.elLimit.MaxWidth = safeParseInt( getComputedStyle(globalVars.el).width );
    globalVars.elLimit.MaxHeight = safeParseInt( getComputedStyle(globalVars.el).height );
    globalVars.elLimit.MinWidth = safeParseInt( getComputedStyle(globalVars.el).width );
    globalVars.elLimit.MinHeight = safeParseInt( getComputedStyle(globalVars.el).height );
    globalVars.elLimit.offsetX = safeParseInt( getComputedStyle(camContainer).width );
    globalVars.elLimit.offsetY = safeParseInt( getComputedStyle(camContainer).height );
    globalVars.coefficient = safeParseInt( getComputedStyle(globalVars.el).height ) * 0.01;

    // Отслеживание жестов на камере
    cam.addEventListener('pointerdown', pointerdownHandler);
    cam.addEventListener('pointermove', pointermoveHandler);
    cam.addEventListener('pointerup', pointerupHandler);
    cam.addEventListener('pointercancel', pointerupHandler);
    cam.addEventListener('pointerout', pointerupHandler);
    cam.addEventListener('pointerleave', pointerupHandler);

    // Отслеживаие изменения стилей css
    const mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const str = ( getTransformMatrix(globalVars.el)[0] * 100 ).toFixed(0);
                zommValue.textContent = str + ' %';
            }
        });
    });

    const mutationConfig = { attributes: true };
    mutationObserver.observe(cam, mutationConfig);
}

