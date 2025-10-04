type Next<T> = { value?: T | null; done: boolean };

export class _GatedBuffer implements AsyncIterable<string> {
  private queue: string[];
  private done: boolean;
  private permits: number;
  private waiter: ((n: Next<string>) => void) | null;

  constructor() {
    this.queue = [];
    this.done = false;
    this.permits = 0;
    this.waiter = null;
  }

  add(s: string): void {
    if (!this.done) {
      this.queue.push(s);
      this._drain();
    }
  }

  release(n = 1) {
    this.permits += n;
    this._drain();
  }

  close() {
    this.done = true;
  }

  private _drain() {
    if (!this.waiter) return;

    if (this.queue.length > 0 && this.permits > 0) {
      this.permits--;
      const v = this.queue.shift();
      const w = this.waiter;
      this.waiter = null;
      w({ value: v, done: false });
      return;
    }

    if (this.done && this.queue.length === 0) {
      const w = this.waiter;
      this.waiter = null;
      w({ value: null, done: true });
    }
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      const next = await new Promise<Next<string>>((r) => {
        this.waiter = r;
        this._drain();
      });
      if (next.done) return;
      yield next.value as string;
    }
  }
}
