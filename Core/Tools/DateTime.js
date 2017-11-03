/**
 * A tool to get the current date and time.
 */
class DateTime extends Date {
    constructor(...args) {
        super(...args);
        this.Y = this.getFullYear();
        this.m = this.getMonth() + 1;
        this.d = this.getDate();
        this.H = this.getHours();
        this.i = this.getMinutes();
        this.s = this.getSeconds();
        this.ms = this.getMilliseconds();

        this.m = this.m >= 10 ? this.m : `0${this.m}`;
        this.d = this.d >= 10 ? this.d : `0${this.d}`;
        this.H = this.H >= 10 ? this.H : `0${this.H}`;
        this.i = this.i >= 10 ? this.i : `0${this.i}`;
        this.s = this.s >= 10 ? this.s : `0${this.s}`;
        if (this.ms < 10) {
            this.ms = `00${this.ms}`;
        } else if (this.ms < 100) {
            this.ms = `0${this.ms}`;
        }

        this.date = `${this.Y}-${this.m}-${this.d}`;
        this.time = `${this.H}:${this.i}:${this.s}.${this.ms}`;
    }

    /**
     * Returns a string representation of a date. The format of the string 
     * depends on the locale. 
     */
    toString() {
        return `${this.date} ${this.time}`;
    }

    /** Returns a date as a string value. */
    toDateString() {
        return this.date;
    }

    /** Returns a time as a string value. */
    toTimeString() {
        return this.time;
    }
}

module.exports = DateTime;