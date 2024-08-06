#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import LineMeta from './line-meta.js';
import FileMeta from './file-meta.js';
import columnSpec from './column-spec.js';
import {outputHeader, outputLine} from './output.js';

const isChildLine = (line) => line.toLowerCase().trim().startsWith('c ');

const getChildLinesFromFile = (absoluteFilePath) => {
    const data = fs.readFileSync(absoluteFilePath).toString();

    // Replace any "Narrow No-Break Space" characters with a regular space
    const cleanData = data.replace(/\u202f/g, ' ');

    const lines = cleanData.split(/\r?\n/);
    const onlyChildLines = lines.filter(isChildLine);

    return onlyChildLines;
};

const countCodes = (line, lineMeta) => {
    const codesMatch = line.toUpperCase().match(/(\[[^\]]+\])/g);

    if (!codesMatch) {
        return;
    }

    codesMatch.forEach((code) => {
        lineMeta.incCode(code);
    });
};

const buildCSV = (listOfFiles) => {
    outputHeader();

    listOfFiles.forEach((fileName) => {
        console.warn(`Processing file: ${fileName}`);
        const fileMeta = new FileMeta(fileName);

        if (!fileMeta.isFinal) {
            console.warn(`WARNING: Excluding non-FINAL file found in input set: ${fileName}`);
            return;
        }

        const lines = getChildLinesFromFile(fileName);
        lines.forEach((line, rowNumber) => {
            const lineMeta = new LineMeta(fileName, rowNumber, line);
            const lineCodes = countCodes(line, lineMeta);
            outputLine(lineMeta);
        });
    });
    console.warn(`Done!`);
};

const printHelp = () => {
    const wasStartedAsBin = process.argv[1].endsWith('seasoning');
    const commandLine = wasStartedAsBin ? path.basename(process.argv[1]) : 'node ' + path.relative(process.cwd(), process.argv[1]);

    console.error('ERROR: No files in the argument list.');
    console.error();
    console.error('The format for this command is:');
    console.error(`${commandLine} [filename(s)] > path\\to\\ouput.csv`);
    console.error();
    console.error('For example, to run the command with two explicitly named files:');
    console.error(`${commandLine}  12345678_Y1_ENG_FINAL.slt 12345678_Y1_ENG_FINAL.slt > output.csv`);
    console.error();
    console.error('For example, to run the command with ALL files in C:\\My Salt Files Directory\\ with the extension ".slt":');
    console.error(`${commandLine}  "C:\\My Salt Files Directory\\*.slt" > output.csv`);
};

if (process.argv.length < 3 || process.argv[2] === '/?' || process.argv[2] === '--help') {
    printHelp();
} else {
    const fileNames = process.argv.slice(2).map((p) => path.resolve(p));
    buildCSV(fileNames);
}
