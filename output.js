import columnSpec from './column-spec.js';

export const outputHeader = () => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => process.stdout.write(`"${col[0]}", `));
    process.stdout.write(`"${columnLast[0]}"\n`);
};

export const outputLine = (lineMeta) => {
    const columns = columnSpec.slice(0);
    const columnLast = columns.pop();
    columns.forEach((col) => process.stdout.write(`"${lineMeta[col[1]] ?? lineMeta.getCode(col[1])}", `));
    process.stdout.write(`"${lineMeta[columnLast[1]] ?? lineMeta.getCode(columnLast[1])}"\n`);
};
