#!/usr/bin/env node

const CoolNodePackage = require("cool-node/package");
const fs = require("fs");
const path = require("path");
const program = require('commander');
const StringTrimmer = require("string-trimmer");

var filename = require.main.children[0].filename,
    cnDir = path.dirname(filename);

var _app;

program.version('1.2.6')
    .arguments("[app]")
    .description("Create a new app, controller, model, view. etc.\n  Notice: if `app` is missing, then work on the main app `www`.")
    .option("-a, --app <subdomain>", "Create a new app with a specified subdomain.")
    .option("-c, --controller <name>", "Create a new controller with a specified name.")
    .option("-m, --model <name>", "Create a new model with a specified name.")
    .option("-v, --view <name>", "Create a new view with a specified name.")
    .option("-t, --type <type>", "Define the controller type name, could be http (default) or socket.")
    .action((app) => _app = app)
    .parse(process.argv);

app = program.app === "www" ? "" : (program.app || (_app === "www" ? "" : _app));
var App = "./App" + (app ? `.${app}` : ""),
    outputFile = (filename, data, type) => {
        var dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            xmkdir(dir);
        }
        fs.writeFileSync(filename, data);
        console.log(`${type} created.`);
    }

if (program.controller) { // Create controller.
    var type = program.type == "socket" ? "Socket" : "Http",
        input = `${cnDir}/templates/${type}Controller.js`,
        condir = `${App}/Controllers`,
        output = `${condir}/${program.controller}.js`,
        contents = fs.readFileSync(input, "utf8").replace(/\{name\}/g, program.controller);
    if ((type == "Socket" && fs.existsSync(`${condir}/SocketController.js`)) ||
        type == "Http" && fs.existsSync(`${condir}/HttpController.js`)) {
        // Get relative dirname of the controller's parent class.
        var outdir = program.controller.split("/"),
            parentDir = "";
        if (outdir.length === 1) {
            parentDir = "./";
        } else {
            for (var i = 1; i < outdir.length; i++) {
                parentDir += "../";
            }
        }
        contents = contents.replace("cool-node/Core/Controllers/", parentDir);
    }
    outputFile(output, contents, "Controller");
} else if (program.model) { // Create model.
    var input = `${cnDir}/templates/Model.js`,
        output = `${App}/Models/${program.model}.js`,
        Model = path.basename(program.model);
    var contents = fs.readFileSync(input, "utf8")
        .replace(/__Model__/g, Model)
        .replace(/__table__/g, Model.toLowerCase());

    outputFile(output, contents, "Model");
} else if (program.view) { // Create view.
    var input = `${cnDir}/templates/View.html`,
        basename = path.basename(program.view),
        dirname = path.dirname(program.view);
    if (basename.length == program.view.length - 1) {
        // If only specified the dirname, then create an index view.
        basename = "index";
        dirname = StringTrimmer.trim(program.view, "/");
    }
    var output = `${App}/Views/${dirname}/${basename}.html`,
        method = "get" + ucfirst(basename),
        controller = basename == "index" ? `${dirname}.index()` : `${dirname}.${method}()`;
    var contents = fs.readFileSync(input, "utf8").replace("{controller}", controller);
    outputFile(output, contents, "View");
} else { // Create app.
    if (!fs.existsSync(App)) {
        xmkdir(App);
        xcopy(`${cnDir}/App.example`, App);
        console.log("App created.");
    } else {
        console.log("App already exists.");
    }
}

/** Copys a directory to a new location. */
function xcopy(src, dst) {
    var stat = fs.statSync(src),
        dir = path.dirname(dst);
    if (!fs.existsSync(dir)) {
        xmkdir(dir);
    }
    if (stat.isDirectory()) {
        var files = fs.readdirSync(src);
        for (let file of files) {
            xcopy(`${src}/${file}`, `${dst}/${file}`);
        }
    } else {
        var input = fs.createReadStream(src),
            output = fs.createWriteStream(dst);
        input.pipe(output);
    }
}

/** Makes a string's first char upper-cased. */
function ucfirst(str) {
    return str[0].toUpperCase() + str.substring(1);
}

/** Makes directory recursively. */
function xmkdir(dir) {
    dir = path.normalize(dir).replace(/\\/g, "/").split("/");
    var _dir = [];
    for (var i = 0; i < dir.length; i++) {
        _dir.push(dir[i]);
        let dirname = _dir.join("/");
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname);
        }
    }
}