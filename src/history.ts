/** Minimal snapshot-based undo/redo stack. */
export class History<T> {
  private past: T[] = [];
  private future: T[] = [];
  constructor(private limit = 200) {}

  push(snapshot: T) {
    this.past.push(snapshot);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  undo(current: T): T | undefined {
    const prev = this.past.pop();
    if (prev === undefined) return undefined;
    this.future.push(current);
    return prev;
  }

  redo(current: T): T | undefined {
    const next = this.future.pop();
    if (next === undefined) return undefined;
    this.past.push(current);
    return next;
  }
}
