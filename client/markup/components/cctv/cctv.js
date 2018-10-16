// TODO: CORS ошибка, ВООБЩЕ НЕ ЗНАЮ КАК ОТ НЕЕ ИЗБАВИТЬСЯ

const Hls = require('hls.js');
const d3 = require('d3');

let rAFVideoId = -1; // Id requestAnimationFrame
let rAFAudioId = -1; // Id requestAnimationFrame

// Инциализаци HLS потока
const initVideo = (video, url) => {
    if (Hls.isSupported()) {
        const config = {
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
        //     if (erData.fatal) {
        //         switch (erData.type) {
        //             case Hls.ErrorTypes.NETWORK_ERROR:
        //             // try to recover network error
        //                 console.log('fatal network error encountered, try to recover');
        //                 hls.startLoad();
        //                 break;
        //             case Hls.ErrorTypes.MEDIA_ERROR:
        //                 console.log('fatal media error encountered, try to recover');
        //                 hls.recoverMediaError();
        //                 break;
        //             default:
        //             // cannot recover
        //                 console.log('HLS Error: ' + erData.type + ' ' + erData.details + ' ' + url);
        //                 hls.destroy();
        //                 break;
        //         }
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
    let prevVideoFullscreen = null;

    const videoFullscreen = cctvFullscreen.querySelector('.cctv__item');
    const videoFullscreenCanvas = videoFullscreen.querySelector('canvas');
    const videoFullscreenCtx = videoFullscreenCanvas.getContext('2d');
    const sound = cctv.querySelector('.cctv__detail__soundlevel');
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


    let audioContext, source, analyser, frequencyData;
    // Работаем со звуком
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        audioContext = new AudioContext();
        // Создаем анализатор
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        // Наш звук в виде массива частот
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
    } else {
        console.log('Ваш браузер не поддерживает Web Audio API');
    }

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

            if (prevVideoFullscreen !== currentVideoFullscreen) {
                source = audioContext.createMediaElementSource(currentVideoFullscreen);
                // Привязываем все друг к дружке
                source.connect(analyser);
                source.connect(audioContext.destination);
            }

            const createSvg = (parent, height, width) => {
                return d3.select(parent).select('svg').attr('height', height).attr('width', width);
            };

            const svgHeight = sound.clientHeight - 30;
            const svgWidth = sound.clientWidth - 30;
            const barPadding = '1';

            const svg = createSvg(sound, svgHeight, svgWidth);
            // Continuously loop and update chart with frequency data.
            const renderChart = () => {
                requestAnimationFrame(renderChart);

                // Copy frequency data to frequencyData array.
                analyser.getByteFrequencyData(frequencyData);

                // Update d3 chart with new data.
                svg.selectAll('rect')
                    .data(frequencyData)
                    .attr('y', function (d) {
                        return svgHeight - d;
                    })
                    .attr('height', function (d) {
                        return d;
                    })
                    .attr('fill', function (d) {
                        return 'rgb(156, ' + d + ', ' + d + ')';
                    });
            };

            // Create our initial D3 chart.
            svg.selectAll('rect')
                .data(frequencyData)
                .enter()
                .append('rect')
                .attr('x', function (d, i) {
                    return i * (svgWidth / frequencyData.length);
                })
                .attr('width', svgWidth / frequencyData.length - barPadding);

            // Run the loop
            rAFAudioId = renderChart();

        });
    });

    // Закроем окно fullscreen
    closeFullscreenBtn.addEventListener('click', () => {
        cctv.classList.toggle('cctv_full');
        currentVideoFullscreen.muted = true;
        cancelAnimationFrame(rAFVideoId);
        cancelAnimationFrame(rAFAudioId);
        prevVideoFullscreen = currentVideoFullscreen;   
        currentVideoFullscreen = null;
        // source.disconnect(analyser);
        // source.disconnect(audioContext.destination);
        filterBritness.value = 1;
        filterContrast.value = 1;
        videoFullscreen.style.filter = 'brightness(1) contrast(1)';
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
        videoFullscreen.style.filter = newFilter;
    });
}
