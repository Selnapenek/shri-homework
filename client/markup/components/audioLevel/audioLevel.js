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
            .attr('width', '100%')
            .attr('height', '100%');
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
        const data = this.frequencyData;
        const barPadding = this.barPadding;
        this.svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', function (d, i) {
                return (i * (100 / data.length)) + '%';
            })
            .attr('width', (100 / data.length - 1) + '%' )
            .attr('height', '100%');

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

