import {VideoFullscreen} from 'components/videoFullscreen/videoFullscreen.js';
import {VideoFilter} from 'components/videoFilter/videoFilter.js';
import {AudioLevel} from 'components/audioLevel/audioLevel.js';

const Hls = require('hls.js');

// Инциализаци HLS потока
const initVideo = (video, url) => {
    if (Hls.isSupported()) {
        const hls = new Hls();
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

    let currentVideoFullscreen = null;

    const videoFullscreenContainer = cctvFullscreen.querySelector('.cctv__item');
    const videoFullscreen = new VideoFullscreen(videoFullscreenContainer);
    
    // Визуализация громости видео
    const audioLevelContainer = cctv.querySelector('.cctv__detail__soundlevel');
    const audioLevel = new AudioLevel(audioLevelContainer);

    // Изменение яркости и контрастности
    const filterInputBritness = cctv.querySelector('.filter_britness');
    const videoFilterBritness = new VideoFilter(videoFullscreenContainer, filterInputBritness, 'brightness');
    videoFilterBritness.onChange();

    const filterInputContrast = cctv.querySelector('.filter_contrast');
    const videoFilterContrast = new VideoFilter(videoFullscreenContainer, filterInputContrast, 'contrast');
    videoFilterContrast.onChange();

    const videoContainers = cctv.querySelectorAll('.cctv__container .cctv__item video');
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
            const dy = ev.y - cctvFullscreen.getBoundingClientRect().y;
            cctvFullscreen.style.transformOrigin = ( ev.x + ev.target.clientWidth / 2 ) + 'px ' + dy + 'px';

            // Продолжим воспроизведение видео с того же момента времени в большом окне
            videoFullscreen.connecVideoSrc(currentVideoFullscreen);
            videoFullscreen.continueFullscreenVideo();
        
            audioLevel.connectAudioSrc(currentVideoFullscreen);
            audioLevel.createSvg();
            audioLevel.initChart();
        });
    });

    const closeFullscreenBtn = cctv.querySelector('.cctv__detail__icon');

    // Закроем окно fullscreen
    closeFullscreenBtn.addEventListener('click', () => {
        cctv.classList.toggle('cctv_full');
        currentVideoFullscreen.muted = true;
        audioLevel.stopRenderChart();
        videoFullscreen.stopContinuePlay();
        videoFilterBritness.toDefaultValue();
        videoFilterContrast.toDefaultValue();
        currentVideoFullscreen = null;
    });
}
