import path from 'path';

export default class FileMeta {
    constructor(fileName) {
        const extension = path.extname(fileName);
        const justTheName = path.basename(fileName, extension);
        const parts = justTheName.toUpperCase().split('_');

        this.fileName = justTheName;
        this.participantId = parts[0];
        this.year = parts[1];
        this.language = parts[2];
        this.isFinal = (parts[3] === 'FINAL');
        this.coder = parts[4];
    }
}
