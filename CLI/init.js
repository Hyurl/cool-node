/** Initiate the project after Cool-Node is installed. */

const path = require("path");
const fs = require("fs");
const { xcopy } = require("../Core/Tools/Functions");

var cnDir = path.dirname(__dirname),
    proDir = path.dirname(path.dirname(cnDir));

// Copy main app.
xcopy(`${cnDir}/App.example`, `${proDir}/App`);
// Copy config.js.
xcopy(`${cnDir}/config.js`, `${proDir}/config.js`);
// Write index.js
fs.writeFileSync("./index.js", `const CoolNode = require("cool-node");`);