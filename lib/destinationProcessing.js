"use strict";

const CONST = require("./const");
const fs = require("fs/promises");

exports._ = {};

exports._.tokenToMessage = function (tokenFromSourceCode) {
    let message = tokenFromSourceCode.sourceToken;

    if (message.toUpperCase() === message) {
        message = message.split("_").join(" ");
        message = message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
    }
    return message;
};

exports._.tokensToAdd = function (tokensFromSourceCode, tokensStructureFromI18n) {
    let existingTokensInI18n = tokensStructureFromI18n
        .filter((tokenDef) => tokenDef.type === CONST.TOKEN.ACTIVE || tokenDef.type === CONST.TOKEN.INACTIVE)
        .map((tokenDef) => tokenDef.name);

    return tokensFromSourceCode.filter(
        (sourceCodeTokenStruct) => existingTokensInI18n.indexOf(sourceCodeTokenStruct.sourceToken) < 0
    );
};

exports._.tokensToDeactivate = function (tokensFromSourceCode, tokensStructureFromI18n) {
    let activeTokensInI18n = tokensStructureFromI18n
        .filter((tokenDef) => tokenDef.type === CONST.TOKEN.ACTIVE)
        .map((tokenDef) => tokenDef.name);
    return activeTokensInI18n.filter(
        (activeTokenFromI18n) =>
            tokensFromSourceCode
                .map((sourceCodeTokenStruct) => sourceCodeTokenStruct.sourceToken)
                .indexOf(activeTokenFromI18n) < 0
    );
};

exports._.tokensToActivate = function (tokensFromSourceCode, tokensStructureFromI18n) {
    let deactivatedTokensInI18n = tokensStructureFromI18n
        .filter((tokenDef) => tokenDef.type === CONST.TOKEN.INACTIVE)
        .map((tokenDef) => tokenDef.name);
    return deactivatedTokensInI18n.filter(
        (inactiveTokenFromI18n) =>
            tokensFromSourceCode
                .map((sourceCodeTokenStruct) => sourceCodeTokenStruct.sourceToken)
                .indexOf(inactiveTokenFromI18n) > -1
    );
};

exports._.operationTokensStructure = function (operation, tokensToOperation, tokensStructureFromI18n) {
    return tokensStructureFromI18n.map((tokenStructure) => {
        let addOperation = tokensToOperation.indexOf(tokenStructure.name) > -1;
        return Object.assign(
            {},
            tokenStructure,
            addOperation
                ? {
                      operation: operation
                  }
                : {}
        );
    });
};

exports._.appendAddTokensToTokenStructure = function (listOfTokensToAdd, tokensStructureFromI18n) {
    return tokensStructureFromI18n.concat(
        listOfTokensToAdd.map((tokenToAdd) => {
            let message = exports._.tokenToMessage(tokenToAdd);
            return Object.assign(
                {
                    type: CONST.TOKEN.ACTIVE,
                    line: `\n#XTIT\n${tokenToAdd}=${message}`,
                    name: tokenToAdd.sourceToken,
                    value: message,
                    operation: CONST.OPERATION.ADD
                },
                tokenToAdd
            );
        })
    );
};

exports.generateTokensFromSourceCode = function (tokensFromSourceCode, tokensStructureFromI18n) {
    let newTokensStructureFromI18n = tokensStructureFromI18n;

    newTokensStructureFromI18n = exports._.operationTokensStructure(
        CONST.OPERATION.ACTIVATE,
        exports._.tokensToActivate(tokensFromSourceCode, tokensStructureFromI18n),
        newTokensStructureFromI18n
    );

    newTokensStructureFromI18n = exports._.operationTokensStructure(
        CONST.OPERATION.DEACTIVATE,
        exports._.tokensToDeactivate(tokensFromSourceCode, tokensStructureFromI18n),
        newTokensStructureFromI18n
    );

    newTokensStructureFromI18n = exports._.appendAddTokensToTokenStructure(
        exports._.tokensToAdd(tokensFromSourceCode, tokensStructureFromI18n),
        newTokensStructureFromI18n
    );

    return newTokensStructureFromI18n;
};

exports.writeBack = function (tokensStructureFromI18n, destinationFileName) {
    return fs.writeFile(destinationFileName, tokensStructureFromI18n.map((tokenStruct) => tokenStruct.line).join("\n"));
};
