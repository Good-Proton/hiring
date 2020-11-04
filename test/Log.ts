import fs from 'fs';
import path from 'path';
import tsame from 'tsame';
import { ActionType } from '../src/Task';
import ITaskExt from './ITaskExt';

const dirname = path.dirname(__filename);
interface ILogRecord {
    date: Date,
    queue: Array<{
        targetId: number
        action: ActionType
        running?: true
        completed?: true
        acquired?: true
    }>
}

export default class Log {
    constructor(name: string, queue: { q: ITaskExt[] }, basepath = dirname) {
        this.path = path.resolve(basepath, `${name}.log.html`);
        this.name = name;
        this.queue = queue;
        this.log = [];
    }

    public start() {
        this.interval = setInterval(this.record.bind(this), 100);
    }

    public stop() {
        this.record();
        if (this.interval) {
            clearInterval(this.interval);
            delete this.interval;
        }
    }

    public record() {
        this.log.push({
            date: new Date(),
            queue: this.queue.q.map(t => ({
                targetId: t.targetId,
                action: t.action,
                running: t.running,
                completed: t.completed,
                acquired: t.acquired
            }))
        });
    }

    public writeHtml() {
        let html = `<!DOCTYPE html>
<html>
<head>
    <title>${this.name} log</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        span {
            font-size: 75%;
        }

        span + span {
            margin-left: 0.4em;
        }

        span.completed {
            background: greenyellow;
        }

        span.running {
            background: orange; 
        }

        span.acquired {
            background: lightgoldenrodyellow; 
        }

        p {
            margin: 0;
        }

        p.all span {
            display: inline-block;
            width: 1em;
            height: 1em;
            border: 1px solid black;
            box-sizing: border-box;
            text-align: center;
            line-height: 1em;
        }
    </style>
</head>
<body>
    <table>
        <caption>${this.name} log</caption>
        <tr>
            <th>time</th><th>total</th><th>completed</th><th>acquired</th><th>running</th><th>queued</th><th>map</th>
        </tr>`;

        let prevRecord: ILogRecord | null = null;
        const start = this.log[0].date.valueOf();
        for (const record of this.log) {
            if (!prevRecord || !tsame(record.queue, prevRecord.queue)) {
                const timeDiff = record.date.valueOf() - (prevRecord ? prevRecord.date.valueOf() : start);
                prevRecord = record;
                html += `
        <tr>
            <td>${record.date.valueOf() - start}ms (+${timeDiff}ms)</td>
            <td>${record.queue.length}</td>
            <td>${record.queue.reduce((count, t) => count + (t.completed ? 1 : 0), 0)}</td>
            <td>${record.queue.reduce((count, t) => count + (t.acquired && !t.completed && !t.running ? 1 : 0), 0)}</td>
            <td>${record.queue.reduce((count, t) => count + (t.running ? 1 : 0), 0)}</td>
            <td>${record.queue.reduce((count, t) => count + (!t.acquired ? 1 : 0), 0)}</td>
            <td>
                <p class="all">`;

                const targetIds = new Set<number>();
                for (const t of record.queue) {
                    targetIds.add(t.targetId);
                    const classes = [];
                    if (t.completed) {
                        classes.push('completed');
                    }
                    if (t.acquired && !t.completed && !t.running) {
                        classes.push('acquired');
                    }
                    if (t.running) {
                        classes.push('running');
                    }
                    html += `<span 
                    title="${t.targetId}:${t.action}" 
                    class="${classes.join(' ')}">${t.targetId}</span>`;
                }
                html += `
                </p>`;
            
                for (const targetId of targetIds) {
                    html += `
                <p class="target target-${targetId}"><span>${targetId}:</span>`;
                    for (const t of record.queue) {
                        if (t.targetId == targetId) {
                            const classes = [];
                            if (t.completed) {
                                classes.push('completed');
                            }
                            if (t.acquired && !t.completed && !t.running) {
                                classes.push('acquired');
                            }
                            if (t.running) {
                                classes.push('running');
                            }
                            html += `<span class="${classes.join(' ')}">${t.action}</span>`;
                        }
                    }
                    html += `
                </p>`;
                }
            
                html += `
            </td>
        </tr>`;
            }
        }

        html += `
    </table>
</body>
</html>`;
        
        fs.writeFileSync(this.path, html);
    }

    private path: string;
    private name: string;
    private queue: { q: ITaskExt[] };
    private log: ILogRecord[];
    private interval?: NodeJS.Timeout;
}
