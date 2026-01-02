export interface LogEntry {
  id: number;
  text: string;
}

let logId = 0;

export function createLog(text: string): LogEntry {
  return {
    id: ++logId,
    text,
  };
}
