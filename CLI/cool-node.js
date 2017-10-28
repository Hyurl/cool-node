#!/usr/bin/env node

const CoolNodePackage = require("cool-node/package");
const fs = require("fs");
const path = require("path");
const program = require('commander');
const StringTrimmer = require("string-trimmer");
const { ucfirst, xcopy, xmkdir } = require("../Core/Tools/Functions");

var filename = require.main.children[0].filename,
    cnDir = path.dirname(filename);

// Initiate the project.
if (!fs.existsSync("./index.js")) {
    fs.writeFileSync("./index.js", `const CoolNode = require("cool-node");`);
}
if (!fs.existsSync("./config.js")) {
    xcopy(cnDir + "/config.js", "./config.js");
}

var _app;

program.version(CoolNodePackage.version)
    .arguments("[app]")
    .description("Create a new app, controller, model, view. etc.\n  Notice: if `app` is missing, then work on the main app `www`.")
    .option("-a, --app <subdomain>", "Create a new app with a specified subdomain.")
    .option("-c, --controller <name>", "Create a new controller with a specified name.")
    .option("-m, --model <name>", "Create a new model with a specified name.")
    .option("--middleware <name>", "Create new middleware with a specified name.")
    .option("-v, --view <name>", "Create a new view with a specified name.")
    .option("-t, --type <type>", "Set the type (`http` or `socket`) when creating a controller or middleware.")
    .action((app) => _app = app)
    .on("--help", () => {
        console.log("\n\n  Examples:\n");
        console.log("    cool-node app1                           Create an app named app1.");
        console.log("    cool-node app1 -c Article                Create an Article http controller in app1.");
        console.log("    cool-node app1 -c ArticleSock -t socket  Create an ArticleSock socket controller in app1.")
        console.log("    cool-node app1 -m Article                Create an Article model in app1");
        console.log("    cool-node app1 -v Article/               Create an Article/index view in app1.");
        console.log("    cool-node app1 -v Article/Hello          Create an Article/Hello view in app1.");
        console.log("    cool-node --middleware Foo               Create Foo http middleware.");
        console.log("    cool-node --middleware Foo -t socket     Create Foo socket middleware.");
        console.log("");
    }).parse(process.argv);

app = program.app === "www" ? "" : (program.app || (_app === "www" ? "" : _app));
var App = "./App" + (app ? `.${app}` : ""),
    outputFile = (filename, data, type) => {
        var dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            xmkdir(dir);
        }
        fs.writeFileSync(filename, data);
        console.log(`${type} '${filename}' created.`);
    }

if (program.controller) { // Create controller.
    var controller = StringTrimmer.trim(program.controller, "/");
    type = program.type == "socket" ? "Socket" : "Http",
        input = `${cnDir}/CLI/templates/${type}Controller.js`,
        condir = `${App}/Controllers`,
        output = `${condir}/${controller}.js`;
    if (fs.existsSync(output)) {
        console.log("Controller already exists.");
    } else {
        var contents = fs.readFileSync(input, "utf8").replace(/\{name\}/g, controller);
        if ((type == "Socket" && fs.existsSync(`${condir}/SocketController.js`)) ||
            type == "Http" && fs.existsSync(`${condir}/HttpController.js`)) {
            // Get relative dirname of the controller's parent class.
            var outdir = controller.split("/"),
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
    }
} else if (program.model) { // Create model.
    var model = StringTrimmer.trim(program.model, "/"),
        input = `${cnDir}/CLI/templates/Model.js`,
        output = `${App}/Models/${model}.js`,
        Model = path.basename(model);
    if (fs.existsSync(output)) {
        console.log("Model already exists.");
    } else {
        var contents = fs.readFileSync(input, "utf8")
            .replace(/__Model__/g, Model)
            .replace(/__table__/g, Model.toLowerCase());

        outputFile(output, contents, "Model");
    }
} else if (program.view) { // Create view.
    var view = StringTrimmer.trimLeft(program.view, "/"),
        input = `${cnDir}/CLI/templates/View.html`,
        basename = path.basename(view),
        dirname = path.dirname(view),
        className = dirname,
        method = "";
    if (view == "" || view == "index") {
        dirname = "";
        basename = "index";
        method = "index";
        className = "Home";
    } else if (view[view.length - 1] == "/") {
        // If only specified the dirname, then create an index view.
        basename = "index";
        method = "index";
        dirname = view;
        className = StringTrimmer.trim(view, "/");
    } else if (dirname == ".") {
        dirname = "";
        if(isNaN(basename)){
            className = "Home";
            method = "get" + basename;
        }
    } else {
        dirname = dirname + "/";
        method = basename == "index" ? basename : "get" + basename;
    }
    var output = `${App}/Views/${dirname}${basename}.html`;
    if (method) {
        var controller = `${className}.${method}()`;
    } else {
        var controller = "none";
    }
    if (fs.existsSync(output)) {
        console.log("View already exists.");
    } else {
        var contents = fs.readFileSync(input, "utf8").replace("{controller}", controller);
        outputFile(output, contents, "View");
    }
} else if (program.middleware) { // Create middleware.
    var middleware = program.middleware;
    if (middleware[middleware.length - 1] == "/") {
        middleware += "index";
    }
    middleware = StringTrimmer.trimLeft(middleware, "/");
    var type = program.type == "socket" ? "Socket" : "Http",
        src = `${cnDir}/CLI/templates/${type}Middleware.js`,
        dst = "./Middleware/" + type.toLowerCase() + `/${middleware}.js`;
    if (fs.existsSync(dst)) {
        console.log(`Middleware '${dst}' already exists.`);
    } else {
        xcopy(src, dst);
        console.log(`Middleware '${dst}' created.`);
    }
} else { // Create app.
    if (fs.existsSync(App)) {
        console.log(`App '${App}' already exists.`);
    } else {
        xmkdir(App);
        xcopy(`${cnDir}/App.example`, App);
        console.log(`App '${App}' created.`);
    }
}