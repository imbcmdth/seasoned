const fs = require('fs');
const path = require('path');

const codeColumns = [
    '[SI-X]',
    '[SI-1]',
    '[SI-2]',
    '[SI-3]',
    '[SI-4]',
    '[SI-5]',
    '[DC-X]',
    '[DC-1]',
    '[DC-2]',
    '[DC-3]',
    '[DC-4]',
    '[CS]',
    '[E]',
    '[D-Rel]',
    '[D-Rel-NF]',
    '[D-Nom]',
    '[D-Nom-NF]',
    '[D-Adv]',
    '[D-Adv-NF]',
    '[D-Ger]',
    '[D-Part]',
    '[D-Inf]',
    '[DirQuote]',
    '[IDK]',
];

const codeColumnsUpperCase = codeColumns.map(c => c.toUpperCase());

const protoResules = codeColumns.slice(0).map(() => 0); // Create a set of 0 columns that is the same length as `columns`
const fileNames = process.argv.slice(2).map((p) => path.resolve(p));
const outputRows = [];

const parseFileName = (absoluteFilePath) => {
    const extension = path.extname(absoluteFilePath);
    const justTheName = path.basename(absoluteFilePath, extension);
    const parts = justTheName.toUpperCase().split('_');

    return {
        name: justTheName,
        participantId: parts[0],
        year: parts[1],
        language: parts[2],
        isFinal: (parts[3] === 'FINAL'),
        coder: parts[4]
    }
};

const getChildLinesFromFile = (absoluteFilePath) => {
    const data = fs.readFileSync(absoluteFilePath).toString();
    const lines = data.split(/\r?\n/);
    const onlyChildLines = lines.filter((line) => line.toLowerCase().trim().startsWith('c '));

    return onlyChildLines;
};

const countCodes = (line) => {
    const codesMatch = line.toUpperCase().match(/(\[[^\]]+\])/g);
    const results = protoResules.slice();

    if (!codesMatch) {
        return results;
    }
    codesMatch.forEach((code) => {
        const index = codeColumnsUpperCase.indexOf(code);
        if (index < 0) {
            return;
        }
        results[index]++;
    });

    return results;
};

const writeHeader = () => {
    process.stdout.write(`"Filename", "Row Number", "Raw Line", "Participant Id", "Year", "Language", "Coder", `);
    const columnsNotLast = codeColumns.slice(0);
    const columnLast = columnsNotLast.pop();
    columnsNotLast.forEach(c => process.stdout.write(`"${c}", `));
    process.stdout.write(`"${columnLast}"\n`);
};

const writeLine = (fileMeta, line, rowNumber, codeCounts) => {
    process.stdout.write(`"${fileMeta.name}", ${rowNumber}, "${line}", "${fileMeta.participantId}", "${fileMeta.year}", "${fileMeta.language}", "${fileMeta.coder}", `);
    process.stdout.write(codeCounts.join(', ') + '\n');
};

const buildCSV = (listOfFiles) => {
    writeHeader();

    listOfFiles.forEach((fileName) => {
        const fileMeta = parseFileName(fileName);
        const lines = getChildLinesFromFile(fileName);
        lines.forEach((line, rowNumber) => {
            const lineCodes = countCodes(line);
            writeLine(fileMeta, line, rowNumber, lineCodes);
        });
    });
};

buildCSV(fileNames);
