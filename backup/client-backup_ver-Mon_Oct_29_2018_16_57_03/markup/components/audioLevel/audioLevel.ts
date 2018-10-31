// TODO: заменить d3 на что-нибудь по легче/ почему-то визуалиция аудио на d3 дофига потребляет
import d3 from "d3";

// const AudioContext = window.AudioContext || window.webkitAudioContext;
// [ts] Property 'webkitAudioContext' does not exist on type 'Window'.
const AudioContext = window.AudioContext;


export class AudioLevel {
    audioLevelContainer: HTMLDivElement;
    audioContext: AudioContext;
    sourceArray: MediaElementAudioSourceNode[];
    currentSource: MediaElementAudioSourceNode | undefined;
    analyser: AnalyserNode;
    frequencyData: Uint8Array;
    svg: d3.Selection<any, any, any, any>  | null; // сложна, проще d3 заменить
    startRender: boolean;
    rAF: number;

    constructor(audioLevelContainer: HTMLDivElement) {
        this.audioLevelContainer = audioLevelContainer;
        this.audioContext = new AudioContext();
        this.sourceArray = [];
        this.currentSource = undefined;
        // Создаем анализатор
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 32;
        // Наш звук в виде массива частот
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.svg = null;
        this.startRender = true;
        this.rAF = -1;
    }

    connectAudioSrc(audioSrc: HTMLMediaElement) {
        this.currentSource = this.sourceArray.find(
            (element: MediaElementAudioSourceNode) => {
                if (element.mediaElement === audioSrc) {
                    return true;
                } else {
                    return false;
                }
            }
        );

        if (!this.currentSource) {
            this.currentSource = this.audioContext.createMediaElementSource(
                audioSrc
            );
            this.sourceArray.push(this.currentSource);
        }
        // Привязываем все друг к дружке
        this.currentSource.connect(this.analyser);
        this.currentSource.connect(this.audioContext.destination);
    }

    createSvg() {
        this.svg = d3
            .select(this.audioLevelContainer + " svg")
            .attr("width", "100%")
            .attr("height", "100%");
    }

    renderChart() {
        if (this.startRender) {
            this.rAF = requestAnimationFrame(this.renderChart.bind(this));
        }
        this.updateData();
        const data : number[] = [...this.frequencyData];
        // Update d3 chart with new data.
        if (this.svg) {
            this.svg
                .selectAll("rect")
                .data(data)
                .attr("fill", (d: number) => {
                    return "rgb(0, " + d + ", " + d + ")";
                });
        }
    }

    initChart() {
        // Create our initial D3 chart.
        const data : number[] = [...this.frequencyData];
        if (this.svg) {
            this.svg
                .selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function(d: number, i: number) {
                    return i * (100 / data.length) + "%";
                })
                .attr("width", 100 / data.length - 1 + "%")
                .attr("height", "100%");

            // Run the loop
            this.startRender = true;
            this.renderChart();
        } else {
            // Ошибку в лог, svg не инциализированно
        }
    }

    // Copy frequency data to frequencyData array.
    updateData() {
        this.analyser.getByteFrequencyData(this.frequencyData);
    }

    stopRenderChart() {
        this.startRender = false;
        cancelAnimationFrame(this.rAF);
        if (this.currentSource) {
            this.currentSource.disconnect();
            this.currentSource = undefined;
        }
    }
}
