export class VideoFilter {
    videoContainer: HTMLDivElement;
    filterInput: HTMLInputElement;
    filterOption: string;
    defaultValue: string;

    constructor(videoContainer : HTMLDivElement, 
                filterInput : HTMLInputElement, 
                filterOption : string, 
                defaultValue : string = '1') {
        this.videoContainer = videoContainer;
        this.filterInput = filterInput;
        this.filterOption = filterOption;
        this.defaultValue = defaultValue;
    }

    changeValue() {
        const optionValue = this.filterInput.value;

        const prevFilter : string | null = getComputedStyle(this.videoContainer).filter;
        let prevFilterArray : string[];
        let optionInex : number;
        let newFilter: string;

        // ВОПРОС: что использовать проверки на null или просто if (prevFilter) ?
        if (prevFilter != null) {
            prevFilterArray = prevFilter.split(' ');

            optionInex = prevFilterArray.findIndex( (elem : string) => {
                const regx : RegExp = new RegExp(this.filterOption);
                return regx.test(elem);
            });

            prevFilterArray[optionInex] = this.filterOption + '(' + optionValue + ')';
            newFilter = prevFilterArray.join(' ');

            this.videoContainer.style.filter = newFilter;
        } else {
            // TODO: Ошибку в лог, что отутствует filter
        }

    }

    toDefaultValue() {
        this.filterInput.value = this.defaultValue;
        this.changeValue();
    }

    onChange() {
        this.filterInput.addEventListener('change', this.changeValue.bind(this));
    }
}

