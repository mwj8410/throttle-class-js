function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Throttle {
  constructor(limit, jitterDelay) {
    this.limit = limit;
    this.jitterDelay = jitterDelay;
    this.queued = [];
    this.running = 0;

    this.drain = this.drain.bind(this);
    this.queue = this.queue.bind(this);
    this.run = this.run.bind(this);
  }

  queue(fn) {
    this.queued.push(fn);
  }

  async run() {
    const errors = [];
    const results = [];

    while(this.queued.length > 0) {
      if (this.running >= this.limit) {
        await this.drain();
      }
      this.running++;
      (this.queued.shift())().then(() => {
        results.push(arguments);
      })
        .catch(() => {
          errors.push(err);
        })
        .finally(() => {
          this.running--;
        });
    }

    return { errors, results };
  }

  async drain(toPoint = this.limit) {
    while (this.running >= toPoint) {
      await sleep(this.jitterDelay);
    }
  }
}


const throttle = new Throttle(5, 100);

for (let i = 0; i < 1000; i ++) {
  throttle.queue(async () => {
    console.log(i + 1);
    await sleep(1000);
  });
}

throttle.run();
