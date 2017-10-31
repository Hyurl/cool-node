/** Initiate the project after Cool-Node is installed. */

const path = require("path");
const fs = require("fs");
const { xcopy, xmkdir } = require("../Core/Tools/Functions");

var cnDir = path.dirname(__dirname),
    proDir = path.dirname(path.dirname(cnDir));

if (!fs.existsSync(`${proDir}/App`)) {
    // Copy main App.
    xcopy(`${cnDir}/App.example`, `${proDir}/App`);
}
if (!fs.existsSync(`${proDir}/Middleware`)) {
    // Copy Middleware.
    xcopy(`${cnDir}/Middleware`, `${proDir}/Middleware`);
}
if (!fs.existsSync(`${proDir}/config.js`)) {
    // Copy config.js.
    xcopy(`${cnDir}/config.js`, `${proDir}/config.js`);
}
if (!fs.existsSync(`${proDir}/index.js`)) {
    // Write index.js
    var data = `const CoolNode = require("cool-node");\nCoolNode.startServer();`;
    fs.writeFileSync(`${proDir}/index.js`, data);
}