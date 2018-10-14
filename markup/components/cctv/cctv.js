// TODO: CORS ошибка, ВООБЩЕ НЕ ЗНАЮ КАК ОТ НЕЕ ИЗБАВИТЬСЯ

const Hls = require('hls.js');

let rAFId = 0; // Id requestAnimationFrame

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
        // hls.on(Hls.Events.ERROR, function (event, erData) {
        //     switch(erData.type) {
        //     case Hls.ErrorTypes.NETWORK_ERROR:
        //     // try to recover network error
        //         console.log("fatal network error encountered, try to recover");
        //         hls.startLoad();
        //         break;
        //     case Hls.ErrorTypes.MEDIA_ERROR:
        //         console.log("fatal media error encountered, try to recover");
        //         hls.recoverMediaError();
        //         break;
        //     default:
        //     // cannot recover
        //         console.log('HLS Error: ' + erData.type + ' ' + erData.details + ' ' + url);
        //         //hls.destroy();
        //         break;
        //     }
        // });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    }
};

export default function () {
    const cctv = document.querySelector('.cctv');
    const cctvFullscreen = cctv.querySelector('.cctv__detail');

    const videoContainers = cctv.querySelectorAll('.cctv__container .cctv__item video');

    let currentVideoFullscreen = null;

    const videoFullscreen = cctvFullscreen.querySelector('.cctv__item');
    const videoFullscreenCanvas = videoFullscreen.querySelector('canvas');
    const videoFullscreenCtx = videoFullscreenCanvas.getContext('2d');
    const closeFullscreenBtn = cctv.querySelector('.cctv__detail__icon');



    const filterBritness = cctv.querySelector('.filter_britness');
    const filterContrast = cctv.querySelector('.filter_contrast');

    // Массив обьектов в которых хранится ресурс видеопотока и контейнер видео
    const videoSrcAndContainer = [
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fsosed%2Fmaster.m3u8',
            container: videoContainers[0]
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fcat%2Fmaster.m3u8',
            container: videoContainers[1]
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fdog%2Fmaster.m3u8',
            container: videoContainers[2]
        },
        {
            src: 'http://localhost:9191/master?url=http%3A%2F%2Flocalhost%3A3102%2Fstreams%2Fhall%2Fmaster.m3u8',
            container: videoContainers[3]
        }
    ];

    videoSrcAndContainer.forEach( (video) => {
        // Инициализация видео
        initVideo(video.container, video.src);

        // На каждый видео элемент повесим событие открытия видео "на весь экран"
        video.container.addEventListener('click', (ev) => {
            cctv.classList.toggle('cctv_full');

            currentVideoFullscreen = ev.target;
            currentVideoFullscreen.muted = false;

            // Анимация появления fullscreen
            // const dx = ev.x - cctvFullscreen.getBoundingClientRect().x;
            const dy = ev.y - cctvFullscreen.getBoundingClientRect().y;
            cctvFullscreen.style.transformOrigin = ( ev.x + ev.target.clientWidth / 2 ) + 'px ' + dy + 'px';

            // Продолжим воспроизведение видео с того же момента времени в большом окне
            // TODO: move to readme
            // canvas + rAF - подоходит для этой задачи,
            // но если задачу маштабировать стоит присмотреть пушку по больше (WebGl)
            const loop = () => {
                // Установим размер canvas такойже как и исходный размер видео
                videoFullscreenCanvas.width = currentVideoFullscreen.videoWidth;
                videoFullscreenCanvas.height = currentVideoFullscreen.videoHeight;
                videoFullscreenCtx.drawImage(video.container, 0, 0);
                rAFId = requestAnimationFrame(loop);
            };
            loop();
        });
    });

    // Закроем окно fullscreen
    closeFullscreenBtn.addEventListener('click', () => {
        cctv.classList.toggle('cctv_full');
        currentVideoFullscreen.muted = true;
        cancelAnimationFrame(rAFId);
    });

    // Изменение яркости и контрастности
    filterBritness.addEventListener('change', () => {
        const brightness = filterBritness.value;

        const prevFilter = getComputedStyle(videoFullscreen).filter;
        let newFilter = prevFilter.split(' ');

        const brightnesInex = newFilter.findIndex( (elem) => {
            const regx = /brightness/;
            return regx.test(elem);
        });

        newFilter[brightnesInex] = 'brightness(' + brightness + ')';
        newFilter = newFilter.join(' ');
        console.log(newFilter);
        videoFullscreen.style.filter = newFilter;
    });
    // TODO: обеденить повторяющийся код...
    filterContrast.addEventListener('change', () => {
        const contrast = filterContrast.value;

        const prevFilter = getComputedStyle(videoFullscreen).filter;
        let newFilter = prevFilter.split(' ');

        const contrastInex = newFilter.findIndex( (elem) => {
            const regx = /contrast/;
            return regx.test(elem);
        });

        newFilter[contrastInex] = 'contrast(' + contrast + ')';
        newFilter = newFilter.join(' ');
        console.log(newFilter);
        videoFullscreen.style.filter = newFilter;
    });

}
