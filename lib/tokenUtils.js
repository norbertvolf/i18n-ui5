"use strict";

const colors = require("colors/safe");
const CONST = require("./const");

exports.numberOfChanges = function (generatedTokensStructureFromI18n) {
    return generatedTokensStructureFromI18n.filter((token) => exports.isValidOperation(token.operation)).length;
};

exports.changesColor = function (generatedTokensStructureFromI18n) {
    let warnings = generatedTokensStructureFromI18n.filter((token) => CONST.OPERATION.ADD !== token.operation).length;
    let allChanges = exports.numberOfChanges(generatedTokensStructureFromI18n);
    return warnings === allChanges ? CONST.COLORS.WARN : CONST.COLORS.ERROR;
};

exports.showChanges = function (generatedTokensStructureFromI18n) {
    generatedTokensStructureFromI18n
        .filter((token) => {
            return exports.isValidOperation(token.operation);
        })
        .forEach((token) => {
            let message = CONST.OPERATION_MESSAGES[token.operation].replace("{0}", token.name);

            console.log(colors[CONST.OPERATION_COLORS[token.operation]](message));
        });
};

exports.showOkChanges = function (generatedTokensStructureFromI18n) {
    generatedTokensStructureFromI18n
        .filter((token) => {
            return exports.isValidOperation(token.operation);
        })
        .forEach((token) => {
            let message = CONST.OPERATION_OK_MESSAGES[token.operation].replace("{0}", token.name);

            console.log(colors[CONST.COLORS.OK](message));
        });
};

exports.isValidOperation = function (operation) {
    return CONST.OPERATION_LIST.indexOf(operation) > -1;
};

exports.operations = {};
exports.operations[CONST.OPERATION.ACTIVATE] = function (tokenStruct) {
    tokenStruct.line = `${tokenStruct.name}=${tokenStruct.value}`;
};
exports.operations[CONST.OPERATION.DEACTIVATE] = function (tokenStruct) {
    tokenStruct.line = `#${tokenStruct.name}=${tokenStruct.value}`;
};

exports.runOperations = function (generatedTokensStructureFromI18n) {
    generatedTokensStructureFromI18n
        .filter((tokenStruct) => {
            return exports.isValidOperation(tokenStruct.operation) && exports.operations[tokenStruct.operation];
        })
        .forEach((tokenStruct) => {
            exports.operations[tokenStruct.operation](tokenStruct);
        });
    return generatedTokensStructureFromI18n;
};
