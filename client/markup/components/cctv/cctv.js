// TODO: CORS ошибка, ВООБЩЕ НЕ ЗНАЮ КАК ОТ НЕЕ ИЗБАВИТЬСЯ

const Hls = require('hls.js');
const d3 = require('d3');

// Инциализаци HLS потока
const initVideo = (video, url) => {
    if (Hls.isSupported()) {
        const config = {
            capLevelToPlayerSize: true,
            // debug: true,
            // Почему-то сильно тупил сервер раздачи - теперь танцую с бубном
            // Простой ребут не помогал, эти конфиги хоть как-то сгладили проблему
            maxBufferLength: 120,
            maxBufferSize: 240 * 1000 * 1000,
            maxBufferHole: 4,
            maxFragLookUpTolerance: 0.6,
            maxMaxBufferLength: 2400
        };
        const hls = new Hls(config);
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(url);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play()
                    .catch(() => console.log('Видео не запустилось' + video));
            });
        });

        // Обработка ошибок
        hls.on(Hls.Events.ERROR, function (event, erData) {
            if (erData.fatal) {
                switch (erData.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                    // try to recover network error
                        console.log('fatal network error encountered, try to recover');
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.log('fatal media error encountered, try to recover');
                        hls.recoverMediaError();
                        break;
                    default:
                    // cannot recover
                        console.log('HLS Error: ' + erData.type + ' ' + erData.details + ' ' + url);
                        hls.destroy();
                        break;
                }
            }
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    }
};

// ВОПРОС: плохая практика так делать, когда хвататает одного замыкания?
// Глобальных переменных cctv 
const cctvGlobalVars = {
    cctv: null,
    cctvFullscreen: null,
    videoContainers: null,
    currentVideoFullscreen: null,
    videoFullscreen: null,
    videoFullscreenCanvas: null,
    videoFullscreenCtx: null,
    soundLevelContainer: null,
    soundLevelSvg: null,
    closeFullscreenBtn: null,
    filterBritness: null,
    filterContrast: null,
    videoSrcAndContainer: [
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8',
            container: null
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8',
            container: null
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8',
            container: null
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8',
            container: null
        }
    ],
    rAFVideoId: -1,
    rAFSounId: -1
};

// Создание SVG элемента средствами d3
const createSvg = (parent, height, width) => {
    return d3.select(parent).append('svg').attr('height', height).attr('width', width);
};

// Инициализации глобальных переменных cctv
const initCctv = () => {
    cctvGlobalVars.cctv = document.querySelector('.cctv');
    cctvGlobalVars.cctvFullscreen = cctvGlobalVars.cctv.querySelector('.cctv__detail');

    cctvGlobalVars.videoContainers = cctvGlobalVars.cctv.querySelectorAll('.cctv__container .cctv__item video');
    cctvGlobalVars.currentVideoFullscreen = null;

    cctvGlobalVars.videoFullscreen = cctvGlobalVars.cctvFullscreen.querySelector('.cctv__item');
    cctvGlobalVars.videoFullscreenCanvas = cctvGlobalVars.videoFullscreen.querySelector('canvas');
    cctvGlobalVars.videoFullscreenCtx = cctvGlobalVars.videoFullscreenCanvas.getContext('2d');

    cctvGlobalVars.soundLevelContainer = cctvGlobalVars.cctv.querySelector('.cctv__detail__soundlevel');

    cctvGlobalVars.closeFullscreenBtn = cctvGlobalVars.cctv.querySelector('.cctv__detail__icon');

    cctvGlobalVars.filterBritness = cctvGlobalVars.cctv.querySelector('.filter_britness');
    cctvGlobalVars.filterContrast = cctvGlobalVars.cctv.querySelector('.filter_contrast');

    cctvGlobalVars.videoSrcAndContainer.forEach( (item, index) => {
        item.container = cctvGlobalVars.videoContainers[index];
    });
};

//
const continueFullscreenVideo = () => {
    // Установим размер canvas такойже как и исходный размер видео
    cctvGlobalVars.videoFullscreenCanvas.width = cctvGlobalVars.currentVideoFullscreen.videoWidth;
    cctvGlobalVars.videoFullscreenCanvas.height = cctvGlobalVars.currentVideoFullscreen.videoHeight;
    cctvGlobalVars.videoFullscreenCtx.drawImage(cctvGlobalVars.currentVideoFullscreen, 0, 0);
    cctvGlobalVars.rAFVideoId = requestAnimationFrame(continueFullscreenVideo);
};

const initVisualAudio = (svg, frequencyData, analyser) => {

    const barPadding = '1';

    //  Первоначальный график на D3
    svg.selectAll('rect')
        .data(frequencyData)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return i * (cctvGlobalVars.svgWidth / frequencyData.length);
        })
        .attr('width', cctvGlobalVars.svgWidth / frequencyData.length - barPadding);

    // Рендер визуализатора звука
    const renderChart = () => {
        cctvGlobalVars.rAFSounId = requestAnimationFrame(renderChart);
        // Copy frequency data to frequencyData array.
        analyser.getByteFrequencyData(frequencyData);

        // Обновляем график с новыми данными
        svg.selectAll('rect')
            .data(frequencyData)
            .attr('y', function (d) {
                return cctvGlobalVars.svgHeight - d;
            })
            .attr('height', function (d) {
                return d;
            })
            .attr('fill', function (d) {
                return 'rgb(0, 0, ' + d + ')';
            });
    };
    renderChart();
};

// Инициализация аудио из видео ресурса
const initAudio = (video) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaElementSource(video);
        // Создаем анализатор
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        // Привязываем все друг к дружке
        source.connect(analyser);
        source.connect(audioContext.destination);
        // Наш звук в виде массива частот
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        //  Визуализируем наши часоты
        initVisualAudio(cctvGlobalVars.soundLevelSvg, frequencyData, analyser);
    } else {
        console.log('Ваш браузер не поддерживает Web Audio API');
    }
};

export default function () {
    
    initCctv();

    cctvGlobalVars.videoSrcAndContainer.forEach( (video) => {
        // Инициализация видео
        initVideo(video.container, video.src);
        // На каждый видео элемент повесим событие открытия видео "на весь экран"
        video.container.addEventListener('click', (ev) => {
            cctvGlobalVars.cctv.classList.toggle('cctv_full'); // ВОПРОС: лучше просто classList.add() или и так нормально?

            cctvGlobalVars.currentVideoFullscreen = ev.target;
            cctvGlobalVars.currentVideoFullscreen.muted = false;

            // Анимация появления fullscreen
            // const dx = ev.x - cctvFullscreen.getBoundingClientRect().x;
            const dy = ev.y - cctvGlobalVars.cctvFullscreen.getBoundingClientRect().y;
            cctvGlobalVars.cctvFullscreen.style.transformOrigin = ( ev.x + ev.target.clientWidth / 2 ) + 'px ' + dy + 'px';

            // Продолжим воспроизведение видео с того же момента времени в большом окне
            continueFullscreenVideo();
            if (!cctvGlobalVars.soundLevelSvg) {
                cctvGlobalVars.svgHeight = cctvGlobalVars.soundLevelContainer.clientHeight - 30;
                cctvGlobalVars.svgWidth = cctvGlobalVars.soundLevelContainer.clientWidth - 30;
                cctvGlobalVars.soundLevelSvg = createSvg(cctvGlobalVars.soundLevelContainer, cctvGlobalVars.svgHeight, cctvGlobalVars.svgWidth);
            }           
            initAudio(cctvGlobalVars.currentVideoFullscreen);
        });
    });

    // Закроем окно fullscreen
    cctvGlobalVars.closeFullscreenBtn.addEventListener('click', () => {
        cctvGlobalVars.cctv.classList.toggle('cctv_full');
        cancelAnimationFrame(cctvGlobalVars.rAFVideoId);
        cancelAnimationFrame(cctvGlobalVars.rAFSoundId);
        cctvGlobalVars.videoFullscreenCanvas.width = 0;
        cctvGlobalVars.videoFullscreenCanvas.height = 0;
        cctvGlobalVars.currentVideoFullscreen.muted = true;
        cctvGlobalVars.currentVideoFullscreen = null;
    });

    // Изменение яркости и контрастности
    cctvGlobalVars.filterBritness.addEventListener('change', () => {
        const brightness = cctvGlobalVars.filterBritness.value;

        const prevFilter = getComputedStyle(cctvGlobalVars.videoFullscreen).filter;
        let newFilter = prevFilter.split(' ');

        const brightnesInex = newFilter.findIndex( (elem) => {
            const regx = /brightness/;
            return regx.test(elem);
        });

        newFilter[brightnesInex] = 'brightness(' + brightness + ')';
        newFilter = newFilter.join(' ');
        cctvGlobalVars.videoFullscreen.style.filter = newFilter;
    });
    // TODO: обеденить повторяющийся код...
    cctvGlobalVars.filterContrast.addEventListener('change', () => {
        const contrast = cctvGlobalVars.filterContrast.value;

        const prevFilter = getComputedStyle(cctvGlobalVars.videoFullscreen).filter;
        let newFilter = prevFilter.split(' ');

        const contrastInex = newFilter.findIndex( (elem) => {
            const regx = /contrast/;
            return regx.test(elem);
        });

        newFilter[contrastInex] = 'contrast(' + contrast + ')';
        newFilter = newFilter.join(' ');
        cctvGlobalVars.videoFullscreen.style.filter = newFilter;
    });
}
