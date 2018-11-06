import { Drowsy } from 'static/js/libraries/drowsy';
import { View } from 'static/js/libraries/drowsy/View';

const flux = new Drowsy();

// Расстояния между первым косанием и движением
const getDiffXY = (startX, startY, x, y) => {
    const dx = x - startX;
    const dy = y - startY;
    return {dx, dy};
};

// Для того что бы достать значение яркости из css фильтра
const safeParseInt = (val) => {
    return parseInt(isNaN(val) ? val.replace(/[^-\d]\.+/g, '') : val, 10);
};
// Для того что бы достать значение яркости из css фильтра
const safeParseFloat = (val) => {
    return parseFloat(isNaN(val) ? val.replace(/[^\d\\.]+/g, '') : val);
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

    const prevStyle = safeParseFloat(getComputedStyle(el)[styleKey]);
    let newStyle = prevStyle + parseFloat(value);
    // Ограничение на стилевые параметры
    if (limitationMinMax.length === 2) {
        newStyle = newStyle < limitationMinMax[0] ? limitationMinMax[0] : newStyle;
        newStyle = newStyle > limitationMinMax[1] ? limitationMinMax[1] : newStyle;
    }
    el.style[styleKey] = strBefore + roundFloat(newStyle) + strAfter;
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

class AdditionCam extends View {

    constructor() {
        super();
        this.currentState = null; // Координаты x,y нажатия
        this.evCache = [];
        this.prevDiff = -1;
        this.prevAngle = -1;
        this.el = null;
        this.elLimit = {
            MaxWidth: 0,
            MinWidth: 0,
            MaxHeight: 0,
            MinHeight: 0,
            offsetX: 0,
            offsetY: 0
        };
        this.gesture = null;

    }

    init(cam, camContainer) {
        this.el = cam;

        // При ресайзе пользовательского окна надо будет обновлять эти параметры
        this.elLimit.MaxWidth = safeParseInt( getComputedStyle(this.el).width );
        this.elLimit.MaxHeight = safeParseInt( getComputedStyle(this.el).height );
        this.elLimit.MinWidth = safeParseInt( getComputedStyle(this.el).width );
        this.elLimit.MinHeight = safeParseInt( getComputedStyle(this.el).height );
        this.elLimit.offsetX = safeParseInt( getComputedStyle(camContainer).width );
        this.elLimit.offsetY = safeParseInt( getComputedStyle(camContainer).height );

        cam.addEventListener('pointerdown', this.pointerdownHandler.bind(this));
        cam.addEventListener('pointermove', this.pointermoveHandler.bind(this));
        cam.addEventListener('pointerup', this.pointerupHandler.bind(this));
        cam.addEventListener('pointercancel', this.pointerupHandler.bind(this));
        cam.addEventListener('pointerout', this.pointerupHandler.bind(this));
        cam.addEventListener('pointerleave', this.pointerupHandler.bind(this));
    }

    // Получение координат события
    setState(ev) {
        this.currentState = {
            startX: ev.x,
            startY: ev.y,
            clientX: ev.clientX,
            clientY: ev.clientY
        };
    }
    
    // Pointer event
    pointerdownHandler(ev) {
        // Инициализируем состояние нажатия
        this.setState(ev);
        this.evCache.push(ev);
        this.el.setPointerCapture(ev.pointerId);
    }

    pointermoveHandler(ev) {
        if (!this.currentState) {
            return;
        }
    
        if (this.evCache.length === 1) {
            this.procGestureMove(ev.clientX, ev.clientY, ev.target.clientWidth, ev.target.clientHeight);
        }
    
        // Find this event in the cache and update its record with this event
        for (let i = 0; i < this.evCache.length; i++) {
            if (ev.pointerId === this.evCache[i].pointerId) {
                this.evCache[i] = ev;
                break;
            }
            // If two pointers are down, check for pinch gestures or rotate
            if (this.evCache.length === 2) {
                // Calculate the distance and angle between the two pointers
                const curDiffX = Math.abs(this.evCache[0].clientX - this.evCache[1].clientX);
                const curDiffY = Math.abs(this.evCache[0].clientY - this.evCache[1].clientY);
                const curDiff = Math.sqrt(Math.pow(curDiffX, 2) + Math.pow(curDiffY, 2));
                const curAngle = Math.atan2(curDiffY, curDiffX) * 180 / Math.PI;

                // Если пальцы уже двигались
                if (this.prevDiff > 0 && this.prevAngle > 0) {
                    const rotate = Math.abs( this.prevDiff - curDiff ) < 15;
                    const PINCH_THRESHHOLD = Math.sqrt(Math.pow(ev.target.clientWidth, 2) + Math.pow(ev.target.clientHeight, 2)) / 20;
                    const pinch = curDiff / 2 >= PINCH_THRESHHOLD;

                    if (this.gesture === null) {
                        if (rotate) {
                            this.gesture = 'rotate';
                        } else if (pinch) {
                            this.gesture = 'pinch';
                        }
                    }

                    if (rotate && this.gesture === 'rotate') {
                        this.procGestureRotate(curAngle, ev.clientX, ev.clientY);    
                    } else if (pinch && this.gesture === 'pinch') {
                        this.procGesturePinch(curDiff, ev.target.clientWidth, ev.target.clientHeight);
                    }
                }
                // Cache the distance for the next move event
                this.prevDiff = curDiff;
                this.prevAngle = curAngle;
                this.setState(ev);
            }
        }
    }
    
    pointerupHandler(ev) {
        // If the number of pointers down is less than two then reset diff tracker
        if (this.evCache.length < 2) {
            this.prevDiff = -1;
            this.prevAngle = -1;
            this.gesture = null;
        }
        this.removeEvent(ev);
        this.stopMove();
    }

    removeEvent(ev) {
        // Remove this event from the target's cache
        for (let i = 0; i < this.evCache.length; i++) {
            if (this.evCache[i].pointerId === ev.pointerId) {
                this.evCache.splice(i, 1);
                break;
            }
        }
    }

    stopMove() {
        if (!this.currentState) {
            return;
        }
        this.currentState = null;
    }

    procGestureRotate(curAngle, clientX, clientY) {
        const {dx, dy} = getDiffXY(this.currentState.startX, this.currentState.startY, clientX, clientY);
        const da = curAngle - this.prevAngle;
        let singAngl = 1;
        const firstQuarter = dx > 0 && dy > 0 && da < 0;
        const secondQuarter = dx < 0 && dy > 0 && da > 0;
        const thirdQuarter = dx < 0 && dy < 0 && da < 0;
        const fourthQuarter = dx > 0 && dy < 0 && da > 0;
        if ( firstQuarter || secondQuarter || thirdQuarter || fourthQuarter) {
            singAngl = 1;
        } else {
            singAngl = -1;
        }
    
        const coefficient = 0.01 * Math.abs(curAngle - this.prevAngle) * singAngl;
        changeElemenStyle(this.el, coefficient, 'filter', 'brightness(', ')', 0.01, 2);
    }

    procGestureMove(clientX, clientY, clientWidth, clientHeight) {
        const {dx, dy} = getDiffXY(this.currentState.startX, this.currentState.startY, clientX, clientY);
        const coefficient = 0.1;

        const scale = getTransformMatrix(this.el)[0];
        const limits = this.elLimit;
        const limitX = clientWidth * scale - limits.offsetX;
        const limitY = clientHeight * scale - limits.offsetY;

        const martix = [0, 0, 0, 0, dx * coefficient, dy * coefficient];
        const limit = [
            [NaN, NaN, NaN, NaN, -1 * limitX, -1 * limitY],
            [NaN, NaN, NaN, NaN, 0, 0]
        ];
        flux.doAction('change-position-action', 'cam', { martix, limit});
    }

    procGesturePinch(curDiff, clientWidth, clientHeight) {
        // Зум
        const signDiff = curDiff > this.prevDiff ? 1 : -1;

        const martix = [0.1 * signDiff, 0, 0, 0.1 * signDiff, 0, 0];
        const limit = [
            [0.6, NaN, NaN, 0.6, NaN, NaN],
            [2, NaN, NaN, 2, 0, 0]
        ];
        changeElementTransform(this.el, martix, limit);

        const scale = getTransformMatrix(this.el)[0];
        const limits = this.elLimit;
        const limitX = clientWidth * scale - limits.offsetX;
        const limitY = clientHeight * scale - limits.offsetY;

        // Что бы при зумировании не происходило сдвига
        const martixClr = [0, 0, 0, 0, 0, 0];
        const limitClr = [
            [NaN, NaN, NaN, NaN, -1 * limitX, -1 * limitY],
            [NaN, NaN, NaN, NaN, 0, 0]
        ];
        changeElementTransform(this.el, martixClr, limitClr);
    }

    update(data) {
        switch (data[0].stateName) {
            case 'change-position':
                changeElementTransform(this.el, data[0].stateData.martix, data[0].stateData.limit);
                break;
            default:
                break;
        }
    }
}


export default function () {
    const cam = document.querySelector('.addition__cam__img');
    const camContainer = document.querySelector('.addition__cam');
    const zommValue = document.querySelector('.addition__cam__zoom .addition__optional__value');
    const brightValue = document.querySelector('.addition__cam__brightness .addition__optional__value');

    const additionCam = new AdditionCam(cam);
    additionCam.init(cam, camContainer);

    flux.addView('cam', additionCam);
    flux.addActionToView('change-position-action', 'cam');
    flux.registrateCallback('camChangePosition', camChangePosition, 'change-position-action');
    flux.store.subscribe('cam', 'change-position');

    // Отслеживаие изменения стилей css
    const mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                let str = ( getTransformMatrix(additionCam.el)[0] * 100 ).toFixed(0);
                zommValue.textContent = str + ' %';

                str = safeParseFloat( getComputedStyle(additionCam.el).filter );
                brightValue.textContent = (str * 100).toFixed(0) + ' %';
            }
        });
    });

    const mutationConfig = { attributes: true };
    mutationObserver.observe(cam, mutationConfig);
}

function camChangePosition(args) {
    flux.store.setState("change-position", args);
}
