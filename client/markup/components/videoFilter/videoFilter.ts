export class VideoFilter {
    constructor(videoContainer, filterInput, filterOption, defaultValue = 1) {
        this.videoContainer = videoContainer;
        this.filterInput = filterInput;
        this.filterOption = filterOption;
        this.defaultValue = defaultValue;
    }

    changeValue() {
        const optionValue = this.filterInput.value;

        const prevFilter = getComputedStyle(this.videoContainer).filter;
        let newFilter = prevFilter.split(' ');

        const optionInex = newFilter.findIndex( (elem) => {
            const regx = new RegExp(this.filterOption);
            return regx.test(elem);
        });

        newFilter[optionInex] = this.filterOption + '(' + optionValue + ')';
        newFilter = newFilter.join(' ');
        this.videoContainer.style.filter = newFilter;
    }

    toDefaultValue() {
        this.filterInput.value = this.defaultValue;
        this.changeValue();
    }

    onChange() {
        this.filterInput.addEventListener('change', this.changeValue.bind(this));
    }
}

