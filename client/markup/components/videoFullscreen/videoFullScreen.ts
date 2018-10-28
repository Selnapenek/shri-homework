export class VideoFullscreen {
    videoFullScreenContainer: HTMLDivElement;
    videoFullscreenCanvas: HTMLCanvasElement;
    videoFullscreenCtx: CanvasRenderingContext2D | null;
    videoSrc: HTMLVideoElement | null;
    rAF: number;
    continePlay: boolean;

    constructor(videoFullScreenContainer : HTMLDivElement) {
        this.videoFullScreenContainer = videoFullScreenContainer;
        // querySelector<HTMLCanvasElement> наверное было бы правильнее
        // Но так в компоненте (.pug файле) подразумевается canvas считаю что такой каст лучше
        this.videoFullscreenCanvas = this.videoFullScreenContainer.querySelector('canvas') as HTMLCanvasElement;
        this.videoFullscreenCtx = this.videoFullscreenCanvas.getContext('2d');
        this.videoSrc = null;
        this.rAF = -1;
        this.continePlay = true;
    }

    connecVideoSrc(videoSrc : HTMLVideoElement) {
        this.videoSrc = videoSrc;
        this.continePlay = true;
    }

    // Продолжим воспроизведение видео с того же момента времени в большом окне
    continueFullscreenVideo() {
        // Установим размер canvas такойже как и исходный размер видео
        if (this.videoSrc != null) {
            this.videoFullscreenCanvas.width = this.videoSrc.videoWidth;
            this.videoFullscreenCanvas.height = this.videoSrc.videoHeight;
    
            if (this.videoFullscreenCtx != null) {
                this.videoFullscreenCtx.drawImage(this.videoSrc, 0, 0);
                if (this.continePlay) {
                    this.rAF = requestAnimationFrame(this.continueFullscreenVideo.bind(this));
                }
            } else {
                // TODO: Ошибку в лог, что нет контекста canvas
            }
        } else {
            // TODO: Ошибку в лог, что нет ресурса видео
        }
    }

    stopContinuePlay() {
        this.continePlay = false;
        cancelAnimationFrame(this.rAF);
        this.videoSrc = null;
    }
}
