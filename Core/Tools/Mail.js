const Nodemailer = require("nodemailer");

/**
 * A wrapper for Nodemailer to send e-mails.
 */
class Mail {
    /**
     * Create a new Mail instance with specified options or a subject.
     * 
     * @param {String|Object} options 
     */
    constructor(options = {}) {
        if (typeof options == "string")
            options = { subject: options };
        this.transporter = Nodemailer.createTransport(config.mail);
        this.__from = options.from || config.mail.from;
        this.__to = options.to || [];
        this.__cc = options.cc || [];
        this.__bcc = options.bcc || [];
        this.__subject = options.subject || "";
        this.__text = options.text || "";
        this.__html = options.html || "";
        this.__attachments = options.attchments || [];
    }

    /**
     * Sets the sender address.
     * 
     * @param  {String}  addr  An e-mail address, optionally you can set a 
     *  name before the actual address.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    from(addr) {
        this.__from = addr;
        return this;
    }

    /**
     * Sets receiver addresses, optionally you can call this method multiple 
     * times to concatenate addresses.
     * 
     * @param {String|Array} addr A list of e-mail addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    to(...addr) {
        if (addr[0] instanceof Array)
            addr = addr[0];
        this.__to = this.__to.concat(addr);
        return this;
    }

    /**
     * Sets receiver addresses on the CC field, optionally you can call this 
     * method multiple times to concatenate addresses.
     * 
     * @param {String|Array} addr A list of e-mail addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    cc(...addr) {
        if (addr[0] instanceof Array)
            addr = addr[0];
        this.__cc = this.__cc.concat(addr);
        return this;
    }

    /**
     * Sets receiver addresses on the BCC field, optionally you can call this 
     * method multiple times to concatenate addresses.
     * 
     * @param {String|Array} addr A list of e-mail addresses, each one passed 
     *  as an parameter, or just pass the fist parameter as an array. 
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    bcc(...addr) {
        if (addr[0] instanceof Array)
            addr = addr[0];
        this.__bcc = this.__bcc.concat(addr);
        return this;
    }

    /**
     * Sets the subject of the e-mail.
     * 
     * @param  {String}  text  The subject name.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    subject(text) {
        this.__subject = text;
        return this;
    }

    /**
     * Sets the plain text version of the e-mail.
     * 
     * @param  {String}  content  The text content.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    text(content) {
        this.__text = content;
        return this;
    }

    /**
     * Sets the HTML version of the e-mail.
     * 
     * @param  {String}  content  The HTML content.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    html(content) {
        this.__html = content;
        return this;
    }

    /**
     * Sets a file as an attachment sent with the e-mail, optionally you can 
     * call this method multiple times to attach multiple files.
     * 
     * @param  {String}  path  The file path.
     * 
     * @return {Mail} Returns the current instance for function chaining.
     */
    attchment(path) {
        this.__attachments.push({ path });
        return this;
    }

    /**
     * Sends the e-mail to all recipients.
     * 
     * @return {Promise} Returns a Promise, and the only argument passed to 
     *  the callback of `then()` is an object which may carry these 
     *  information:
     *  - `messageId` the final Message-Id value;
     *  - `envelope` the envelope object for the message;
     *  - `accepted` recipient addresses that were accepted by the server;
     *  - `rejected` recipient addresses that were rejected by the server;
     *  - `pending` recipient addresses that were temporarily rejected;
     *      together with the server response;
     *  - `response` the last SMTP response from the server. 
     */
    send() {
        var options = {
            from: this.__from,
            to: this.__to,
            subject: this.__subject,
        };
        if (this.__cc)
            options.cc = this.__cc;
        if (this.__bcc)
            options.bcc = this.__bcc;
        if (this.__text)
            options.text = this.__text;
        if (this.__html)
            options.html = this.__html;
        if (this.__attachments)
            options.attchments = this.__attachments;
        return this.transporter.sendMail(options);
    }
}

module.exports = Mail;