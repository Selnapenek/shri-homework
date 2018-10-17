const d3 = require('d3');
const AudioContext = window.AudioContext || window.webkitAudioContext;

export class AudioLevel {
    constructor(audioLevelContainer) {
        this.audioLevelContainer = audioLevelContainer;
        this.audioContext = new AudioContext();
        this.sourceArray = [];
        this.currentSource = -1;
        // Создаем анализатор
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 32;
        // Наш звук в виде массива частот
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

        this.svgHeight = this.audioLevelContainer.clientHeight - 30;
        this.svgWidth = this.audioLevelContainer.clientWidth - 30;
        this.barPadding = '1';
        this.svg = null;
        this.startRender = true;
        this.rAF = -1;
    }

    connectAudioSrc(audioSrc) {
        this.currentSource = this.sourceArray.find( (element) => {
            if (element.mediaElement === audioSrc) {
                return element;
            }
        });

        if (!this.currentSource) {
            this.currentSource = this.audioContext.createMediaElementSource(audioSrc);
            this.sourceArray.push(this.currentSource);
        }
        // Привязываем все друг к дружке
        this.currentSource.connect(this.analyser);
        this.currentSource.connect(this.audioContext.destination);
    }

    createSvg() {
        this.svg = d3.select(this.audioLevelContainer)
            .select('svg')
            .attr('viewBox', '0 0 300 300')
            .attr('height', this.svgHeight)
            .attr('width', this.svgWidth);
    }

    renderChart() {
        if (this.startRender) {
            this.rAF = requestAnimationFrame(this.renderChart.bind(this));
        }
        this.updateData();
        const data = this.frequencyData;
        // Update d3 chart with new data.
        this.svg.selectAll('rect')
            .data(data)
            .attr('fill', (d) => {
                return 'rgb(0, ' + d + ', ' + d + ')';
            });
    }

    initChart() {
        // Create our initial D3 chart.
        const width = this.svgWidth;
        const height = this.svgHeight;
        const data = this.frequencyData;
        const barPadding = this.barPadding;
        this.svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function (d, i) {
                return i * (width / data.length);
            })
            .attr('width', width / data.length - barPadding)
            .attr('height', height);

        // Run the loop
        this.startRender = true;
        this.renderChart();
    }

    // Copy frequency data to frequencyData array.
    updateData() {
        this.analyser.getByteFrequencyData(this.frequencyData);
    }

    stopRenderChart() {
        this.startRender = false;
        cancelAnimationFrame(this.rAF);
        this.currentSource.disconnect();
    }
}

