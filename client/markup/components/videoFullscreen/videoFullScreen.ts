export class VideoFullscreen {
    constructor(videoFullScreenContainer) {
        this.videoFullScreenContainer = videoFullScreenContainer;
        this.videoFullscreenCanvas = this.videoFullScreenContainer.querySelector('canvas');
        this.videoFullscreenCtx = this.videoFullscreenCanvas.getContext('2d');
        this.videoSrc = null;
        this.rAF = -1;
        this.continePlay = true;
    }

    connecVideoSrc(videoSrc) {
        this.videoSrc = videoSrc;
        this.continePlay = true;
    }

    // Продолжим воспроизведение видео с того же момента времени в большом окне
    continueFullscreenVideo() {
        // Установим размер canvas такойже как и исходный размер видео
        this.videoFullscreenCanvas.width = this.videoSrc.videoWidth;
        this.videoFullscreenCanvas.height = this.videoSrc.videoHeight;
        this.videoFullscreenCtx.drawImage(this.videoSrc, 0, 0);
        if (this.continePlay) {
            this.rAF = requestAnimationFrame(this.continueFullscreenVideo.bind(this));
        }
    }

    stopContinuePlay() {
        this.continePlay = false;
        cancelAnimationFrame(this.rAF);
        this.videoSrc = null;
    }
}
