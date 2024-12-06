#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import LineMeta from './line-meta.js';
import FileMeta from './file-meta.js';
import {outputHeader, outputLine} from './output.js';
import {globSync} from 'glob';

const isChildLine = (line) => line.toLowerCase().trim().startsWith('c ');
const isHeaderLine = (line) => line.toLowerCase().trim().startsWith('+ ');

const getLinesFromFile = (absoluteFilePath) => {
    try {
        const data = fs.readFileSync(absoluteFilePath).toString();

        // Replace any "Narrow No-Break Space" characters with a regular space
        const cleanData = data.replace(/\u202f/g, ' ');

        const lines = cleanData.split(/\r?\n/);
        return lines;
    } catch(e) {
        console.error(`ERROR: Reading '${absoluteFilePath}' failed!`, e);
        return [];
    }
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
        let utteranceRow = 0;

        getLinesFromFile(fileName).forEach((line) => {
            if (isHeaderLine(line)) {
                const headerData = line.slice(2);
                const [headerName, headerValue] = headerData.split(': ');

                return fileMeta.setHeader(headerName, headerValue);
            }

            if (isChildLine(line)) {
                const lineMeta = new LineMeta(fileMeta, utteranceRow++, line);
                const lineCodes = countCodes(line, lineMeta);
                return outputLine(lineMeta);
            }
        });
        const meta = Object.entries(fileMeta).map(e => {
            if (e[0] === 'header') {
                return Object.entries(e[1]).map(e => `'${e[0]}': '${e[1]}'`);
            }
            return `'${e[0]}': '${e[1]}'`;
        }).flat().join('\n');
        console.warn(meta);
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
    const fileNames = process.argv.slice(2).map((p) => globSync(p, {
        windowsPathsNoEscape: true
    })).flat();
    buildCSV(fileNames);
}
