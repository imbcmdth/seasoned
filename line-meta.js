import FileMeta from './file-meta.js';

export default class LineMeta extends FileMeta {
    constructor(fileName, rowNumber, rawLine) {
        super(fileName);
        this.rowNumber = rowNumber;
        this.rawLine = rawLine;
        this.codes = {};
    }

    getCode(code) {
        return this.codes[code.toUpperCase()] ?? 0;
    }

    incCode(code) {
        const codeUCase = code.toUpperCase();

        if (this.codes[codeUCase]) {
            this.codes[codeUCase]++;
        } else {
            this.codes[codeUCase] = 1;
        }
    }
}
