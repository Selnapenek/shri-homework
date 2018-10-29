import Hls from 'hls.js';
// TODO: написать алиасы в tsconfig.json
import {VideoFullscreen} from 'components/videoFullscreen/videoFullscreen.ts';
import {VideoFilter} from 'components/videoFilter/videoFilter.ts';
import {AudioLevel} from 'components/audioLevel/audioLevel.ts';

// Инциализаци HLS потока
const initVideo = (video : HTMLVideoElement , url : string) => {
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

// TODO: на класс переписать, думаю и от ненужных проверок избавлюсь (как минимум передам их на увровень выше), и от лишнего typecast'a
export default function () {
    // ДА НЕ БУДУ я писать тысячу is-else, так как я в pug файле задаю view компонета - занчит уверен что querySelector не вернет null
    // ВОПРОС: какой лучше использовать typecast : .. as type или <type> ?
    const cctv : HTMLDivElement = document.querySelector('.cctv') as HTMLDivElement;
    const cctvFullscreen : HTMLDivElement = <HTMLDivElement> cctv.querySelector('.cctv__detail');

    let currentVideoFullscreen : HTMLVideoElement | null = null;

    const videoFullscreenContainer : HTMLDivElement = cctvFullscreen.querySelector('.cctv__item') as HTMLDivElement;
    const videoFullscreen : VideoFullscreen = new VideoFullscreen(videoFullscreenContainer);
    
    // Визуализация громости видео
    const audioLevelContainer : HTMLDivElement = cctv.querySelector('.cctv__detail__soundlevel') as HTMLDivElement;
    const audioLevel : AudioLevel = new AudioLevel(audioLevelContainer);

    // Изменение яркости и контрастности
    const filterInputBritness : HTMLInputElement = cctv.querySelector('.filter_britness') as HTMLInputElement;
    const videoFilterBritness : VideoFilter = new VideoFilter(videoFullscreenContainer, filterInputBritness, 'brightness');
    videoFilterBritness.onChange();

    const filterInputContrast : HTMLInputElement = cctv.querySelector('.filter_contrast') as HTMLInputElement;
    const videoFilterContrast = new VideoFilter(videoFullscreenContainer, filterInputContrast, 'contrast');
    videoFilterContrast.onChange();

    const videoContainers : NodeListOf<HTMLVideoElement> = cctv.querySelectorAll('.cctv__container .cctv__item video');
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
        video.container.addEventListener('click', (ev : MouseEvent | PointerEvent) => {
            if (ev.target) {
                cctv.classList.toggle('cctv_full');
                currentVideoFullscreen = <HTMLVideoElement> ev.target;
                currentVideoFullscreen.muted = false;
    
                // Анимация появления fullscreen
                //  ВОПРОС 
                // почему getBoundingClientRect().y не могу воспльзоваться и приходится мучиться?
                // типо такого (cctvFullscreen.getBoundingClientRect() as DOMRect ).y;  ???
                const dy = ev.y - cctvFullscreen.getBoundingClientRect().top;
                cctvFullscreen.style.transformOrigin = ( ev.x + currentVideoFullscreen.clientWidth / 2 ) + 'px ' + dy + 'px';
    
                // Продолжим воспроизведение видео с того же момента времени в большом окне
                videoFullscreen.connecVideoSrc(currentVideoFullscreen);
                videoFullscreen.continueFullscreenVideo();
            
                audioLevel.connectAudioSrc(currentVideoFullscreen);
                audioLevel.createSvg();
                audioLevel.initChart();
            }
        });
    });

    const closeFullscreenBtn : HTMLElement = cctv.querySelector('.cctv__detail__icon') as HTMLElement;

    // Закроем окно fullscreen
    closeFullscreenBtn.addEventListener('click', () => {
        if(currentVideoFullscreen) {
            currentVideoFullscreen.muted = true;
        }
        cctv.classList.toggle('cctv_full');
        audioLevel.stopRenderChart();
        videoFullscreen.stopContinuePlay();
        videoFilterBritness.toDefaultValue();
        videoFilterContrast.toDefaultValue();
        currentVideoFullscreen = null;
    });
}
