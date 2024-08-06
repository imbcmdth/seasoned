import columnSpec from './column-spec.js';

export const outputHeader = () => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => process.stdout.write(`"${col[0]}",`));
    process.stdout.write(`"${columnLast[0]}"\n`);
};

const writeValue = (lineMeta, prop, eol = ',') => {
    if (prop.startsWith('[') && prop.endsWith(']')) {
        const value = lineMeta.getCode(prop);

        return process.stdout.write(`${value}${eol}`);
    }

    const value = lineMeta.getProp(prop);

    if (typeof value !== 'number' && !value) {
        return process.stdout.write(`${eol}`);
    }
    process.stdout.write(`"${value}"${eol}`);
};

export const outputLine = (lineMeta) => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => writeValue(lineMeta, col[1]));
    writeValue(lineMeta, columnLast[1], '\n');
};
