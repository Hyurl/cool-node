const fs = require("fs");
const Model = require("modelar/Model");
const User = require("modelar/User");
const SubdomainMap = require("./SubdomainMap");

var UserMap = {};

for (let subdomain in SubdomainMap) {
    let file = SubdomainMap[subdomain] + "/Models/User.js";
    if(fs.existsSync(file)){
        let _User = require(file);
        if(_User.prototype instanceof Model){
            UserMap[subdomain] = _User;
        }else{
            UserMap[subdomain] = User;
        }
    }else{
        UserMap[subdomain] = User;
    }
}

module.exports = UserMap;