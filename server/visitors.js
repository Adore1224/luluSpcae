import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const calendar = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function createVisitorStore(directory) {
  let statements;

  function open() {
    if (statements) return statements;
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const db = new DatabaseSync(resolve(directory, 'visitors.sqlite'));
    try {
      db.exec(`
        PRAGMA busy_timeout = 1500;
        CREATE TABLE IF NOT EXISTS visitors (
          id TEXT PRIMARY KEY NOT NULL,
          last_day TEXT NOT NULL
        ) WITHOUT ROWID;
        CREATE INDEX IF NOT EXISTS visitors_last_day ON visitors(last_day);
      `);
      statements = {
        visit: db.prepare(`
          INSERT INTO visitors (id, last_day) VALUES (?, ?)
          ON CONFLICT(id) DO UPDATE SET last_day = excluded.last_day
          WHERE visitors.last_day < excluded.last_day
        `),
        summary: db.prepare(`
          SELECT (SELECT COUNT(*) FROM visitors) AS total,
                 (SELECT COUNT(*) FROM visitors WHERE last_day = ?) AS today,
                 (SELECT COUNT(*) FROM visitors WHERE last_day BETWEEN ? AND ?) AS recent
        `),
      };
      return statements;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  return {
    visit(id, now = new Date()) {
      const digest = createHash('sha256').update(id).digest('hex');
      open().visit.run(digest, calendar.format(now));
    },
    summary(now = new Date()) {
      const day = calendar.format(now);
      const start = new Date(`${day}T00:00:00Z`);
      start.setUTCDate(start.getUTCDate() - 6);
      return open().summary.get(day, start.toISOString().slice(0, 10), day);
    },
  };
}
