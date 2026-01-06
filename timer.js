export class Timer {
    constructor(duration) {
        this.duration = duration;
        this.remainingTime = duration;
        this.isRunning = false;
        this.intervalId = null;
        this.onTick = null;
        this.onComplete = null;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.tick();

        this.intervalId = setInterval(() => {
            this.remainingTime--;
            this.tick();

            if (this.remainingTime <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    resume() {
        if (this.isRunning || this.remainingTime <= 0) return;
        this.start();
    }

    skip() {
        this.pause();
        this.remainingTime = 0;
        this.complete();
    }

    reset() {
        this.pause();
        this.remainingTime = this.duration;
        this.tick();
    }

    tick() {
        if (this.onTick) {
            const percentage = (this.remainingTime / this.duration) * 100;
            this.onTick(this.remainingTime, percentage);
        }
    }

    complete() {
        this.pause();
        if (this.onComplete) {
            this.onComplete();
        }
    }
}
