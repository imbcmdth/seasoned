import path from 'path';

export default class FileMeta {
    constructor(fileName) {
        const extension = path.extname(fileName);
        const justTheName = path.basename(fileName, extension);
        const parts = justTheName.toUpperCase().split(/[_-]+/) ?? [];

        this.absoluteFileName = fileName;
        this.fileName = justTheName;

        parts.forEach((part, index) => {
            this[`fileNamePart_${index}`] = part;
        });

        this.header = {};
    }

    getProp(prop) {
        return this[prop] ?? this.header[prop];
    }

    setHeader(prop, value) {
        if (typeof value === 'string') {
            this.header[prop] = value.trim();
            return;
        }
        this.header[prop] = value;
    }
}
