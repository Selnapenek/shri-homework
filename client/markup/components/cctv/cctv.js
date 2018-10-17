import {VideoFilter} from 'components/videoFilter/videoFilter.js';
import {AudioLevel} from 'components/audioLevel/audioLevel.js';

const Hls = require('hls.js');

let rAFVideoId = -1; // Id requestAnimationFrame

// Инциализаци HLS потока
const initVideo = (video, url) => {
    if (Hls.isSupported()) {
        const config = {
            // debug: true,
            // Почему-то сильно тупил сервер раздачи - теперь танцую с бубном
            // Простой ребут не помогал, эти конфиги хоть как-то сгладили проблему
            // maxBufferLength: 120,
            // maxBufferSize: 240 * 1000 * 1000,
            // maxBufferHole: 4,
            // maxFragLookUpTolerance: 0.6,
            // maxMaxBufferLength: 2400
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

export default function () {
    const cctv = document.querySelector('.cctv');
    const cctvFullscreen = cctv.querySelector('.cctv__detail');

    const videoContainers = cctv.querySelectorAll('.cctv__container .cctv__item video');

    let currentVideoFullscreen = null;

    const videoFullscreen = cctvFullscreen.querySelector('.cctv__item');
    const videoFullscreenCanvas = videoFullscreen.querySelector('canvas');
    const videoFullscreenCtx = videoFullscreenCanvas.getContext('2d');
    const audioLevelContainer = cctv.querySelector('.cctv__detail__soundlevel');
    const closeFullscreenBtn = cctv.querySelector('.cctv__detail__icon');

    const filterInputBritness = cctv.querySelector('.filter_britness');
    const filterInputContrast = cctv.querySelector('.filter_contrast');

    const videoFilterBritness = new VideoFilter(videoFullscreen, filterInputBritness, 'brightness');
    const videoFilterContrast = new VideoFilter(videoFullscreen, filterInputContrast, 'contrast');

    // Изменение яркости и контрастности
    videoFilterBritness.onChange();
    videoFilterContrast.onChange();

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

    const audioLevel = new AudioLevel(audioLevelContainer);

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
            const continueFullscreenVideo = () => {
                // Установим размер canvas такойже как и исходный размер видео
                videoFullscreenCanvas.width = currentVideoFullscreen.videoWidth;
                videoFullscreenCanvas.height = currentVideoFullscreen.videoHeight;
                videoFullscreenCtx.drawImage(currentVideoFullscreen, 0, 0);
                rAFVideoId = requestAnimationFrame(continueFullscreenVideo);
            };
            continueFullscreenVideo();
            
            audioLevel.connectAudioSrc(currentVideoFullscreen);
            audioLevel.createSvg();
            audioLevel.initChart();

        });
    });

    // Закроем окно fullscreen
    closeFullscreenBtn.addEventListener('click', () => {
        cctv.classList.toggle('cctv_full');
        currentVideoFullscreen.muted = true;
        cancelAnimationFrame(rAFVideoId);
        audioLevel.stopRenderChart();
        videoFilterBritness.toDefaultValue();
        videoFilterContrast.toDefaultValue();
        currentVideoFullscreen = null;
    });

}
