//import columnSpec from './column-spec.js';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

const columnSpecFilename = path.resolve(path.join(import.meta.dirname, 'column-spec.yaml'));
const columnSpecText = fs.readFileSync(columnSpecFilename, 'utf8');
const columnSpec = Object.entries(yaml.load(columnSpecText));

console.log('>>', columnSpec);

export const outputHeader = () => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => process.stdout.write(`"${col[0]}",`));
    process.stdout.write(`"${columnLast[0]}"\n`);
};

const writeValue = (lineMeta, prop, sep = ',') => {
    if (prop.startsWith('[') && prop.endsWith(']')) {
        const value = lineMeta.getCode(prop);

        return process.stdout.write(`${value}${sep}`);
    }

    const value = lineMeta.getProp(prop);

    if (typeof value === 'number') {
        return process.stdout.write(`${value}${sep}`);
    }
    if (!value) {
        return process.stdout.write(`${sep}`);
    }
    process.stdout.write(`"${value}"${sep}`);
};

export const outputLine = (lineMeta) => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => writeValue(lineMeta, col[1]));
    writeValue(lineMeta, columnLast[1], '\n');
};
