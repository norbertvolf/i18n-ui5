"use strict";

const CONST = require("./const");
const fg = require("fast-glob");

const PARAMETERS_DEFINITIONS = {
    "--check": function (args, index, options) {
        options.command = CONST.COMMANDS.CHECK;
    },
    "--replace": function (args, index, options) {
        options.command = CONST.COMMANDS.REPLACE;
    },
    "--destination": function (args, index, options) {
        options.destinationFile = args[index + 1];
        return true;
    },
    "--ignore": function (args, index, options) {
        options.ignore = (options.ignore || []).concat([args[index + 1]]);
        return true;
    }
};

exports._ = {};
exports._.parseArguments = function (argv) {
    let stepOver = false;
    let normalizedArgv = [].concat(argv);
    normalizedArgv.shift();
    normalizedArgv.shift();
    return Object.assign(
        {},
        CONST.DEFAULTS,
        normalizedArgv.reduce((acc, argPart, index) => {
            if (stepOver) {
                stepOver = false;
            } else if (PARAMETERS_DEFINITIONS[argPart]) {
                stepOver = PARAMETERS_DEFINITIONS[argPart](normalizedArgv, index, acc);
            } else if (argPart.match(/^-/)) {
                throw new Error(`Parameter "${argPart}" is not valid.`);
            } else {
                if (!acc.globs) {
                    acc.globs = [];
                }
                acc.globs.push(argPart);
            }
            return acc;
        }, {})
    );
};

exports.sourceCodeFiles = function () {
    let parsedArgs = exports._.parseArguments(process.argv);
    return fg(parsedArgs.globs).then((fileNames) => {
        return fileNames.filter((fileName) => parsedArgs.processNodeModules || fileName.indexOf("node_modules") < 0);
    });
};

exports.patterns = function () {
    return exports._.parseArguments(process.argv).patterns;
};

exports.destinationFile = function () {
    return exports._.parseArguments(process.argv).destinationFile;
};

exports.destinationPattern = function () {
    return exports._.parseArguments(process.argv).destinationPattern;
};

exports.command = function () {
    return exports._.parseArguments(process.argv).command;
};

exports.ignore = function () {
    return exports._.parseArguments(process.argv).ignore || [];
};
