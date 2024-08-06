#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// These are the meta columns and will appear first the CSV
const metaColumns = [
    // The format is:
    // ['Column Name', 'fileMeta Field']
    ['File Name', 'fileName'],
    ['Row Number', 'rowNumber'],
    ['Raw Line', 'rawLine'],
    ['Participant Id', 'participantId'],
    ['Year', 'year'],
    ['Language', 'language'],
    ['Coder', 'coder'],
];

// These are the Codes that we look for and output as individual columns.
// To add new codes, remove codes, or change the order of columns simply update the
// list here:
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

// Create a set of upperCase column names to use for searching
const codeColumnsUpperCase = codeColumns.map(c => c.toUpperCase());

// Create a set of 0 columns that is the same length as `columns`
const protoResults = codeColumns.slice(0).map(() => 0);

const parseFileName = (absoluteFilePath) => {
    const extension = path.extname(absoluteFilePath);
    const justTheName = path.basename(absoluteFilePath, extension);
    const parts = justTheName.toUpperCase().split('_');

    return {
        fileName: justTheName,
        participantId: parts[0],
        year: parts[1],
        language: parts[2],
        isFinal: (parts[3] === 'FINAL'),
        coder: parts[4]
    }
};

const createLineMeta = (fileMeta, lineNum, line) => {
    const lineMeta = Object.create(fileMeta);
    lineMeta.rowNumber = lineNum;
    lineMeta.rawLine = line;

    return lineMeta;
};

const isChildLine = (line) => line.toLowerCase().trim().startsWith('c ');

const getChildLinesFromFile = (absoluteFilePath) => {
    const data = fs.readFileSync(absoluteFilePath).toString();

    // Replace any "Narrow No-Break Space" characters with a regular space
    const cleanData = data.replace(/\u202f/g, ' ');

    const lines = cleanData.split(/\r?\n/);
    const onlyChildLines = lines.filter(isChildLine);

    return onlyChildLines;
};

const countCodes = (line) => {
    const codesMatch = line.toUpperCase().match(/(\[[^\]]+\])/g);
    const results = protoResults.slice();

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
    // Write the metaColumn part of the header
    metaColumns.forEach((a) => process.stdout.write(`"${a[0]}", `));

    // Write the codeColumn part of the header
    const columnsNotLast = codeColumns.slice(0);
    const columnLast = columnsNotLast.pop();
    columnsNotLast.forEach((c) => process.stdout.write(`"${c}", `));
    process.stdout.write(`"${columnLast}"\n`);
};

const writeLine = (lineMeta, codeCounts) => {
    metaColumns.forEach((a) => process.stdout.write(`"${lineMeta[a[1]]}", `));
    process.stdout.write(codeCounts.join(', ') + '\n');
};

const buildCSV = (listOfFiles) => {
    writeHeader();

    listOfFiles.forEach((fileName) => {
        const fileMeta = parseFileName(fileName);

        if (!fileMeta.isFinal) {
            console.warn(`WARNING: Excluding non-FINAL file found in input set: ${fileName}`);
            return;
        }

        const lines = getChildLinesFromFile(fileName);
        lines.forEach((line, rowNumber) => {
            const lineCodes = countCodes(line);
            const lineMeta = createLineMeta(fileMeta, rowNumber, line);
            writeLine(lineMeta, lineCodes);
        });
    });
};

const printHelp = () => {
    const wasStartedAsBin = process.argv[1].endsWith('seasoning');
    const commandLine = wasStartedAsBin ? path.basename(process.argv[1]) : 'node ' + path.relative(process.cwd(), process.argv[1]);

    console.error('ERROR: No files in the argument list.');
    console.error();
    console.error('To use this command, pass in a wildcard, or a list of files and save the output to a csv file.');
    console.error();
    console.error('For example, to run the command with two explicitly named files:');
    console.error(`${commandLine}  12345678_Y1_ENG_FINAL.slt 12345678_Y1_ENG_FINAL.slt > output.csv`);
    console.error();
    console.error('For example, to run the command with ALL files in C:\\My Salt Files Directory\\ with the extension ".slt":');
    console.error(`${commandLine}  "C:\\My Salt Files Directory\\*.slt" > output.csv`);
};

if (process.argv.length < 3 || process.argv[2] === '/?' || process.argv[2] === '--help') {
    return printHelp();
}

const fileNames = process.argv.slice(2).map((p) => path.resolve(p));
buildCSV(fileNames);
