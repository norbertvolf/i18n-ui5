"use strict";

const fs = require("fs/promises");
const path = require("path");
const CONST = require("./const");

exports._ = {};

exports._.processsSourceCodeFile = function (patterns, fileName, ignoreList) {
    return Array.isArray(patterns) && typeof fileName === "string"
        ? fs.readFile(fileName).then((buffer) => {
              let matches;
              let i18nTokens = [];
              patterns.forEach(function (pattern) {
                  buffer
                      .toString()
                      .split("\n")
                      .forEach((line, index) => {
                          for (matches = line.match(pattern); matches; matches = line.match(pattern)) {
                              if (ignoreList.indexOf(matches[1].toString()) < 0) {
                                  i18nTokens.push({
                                      sourceFile: fileName,
                                      sourceToken: matches[1].toString(),
                                      sourceLine: index + 1,
                                      sourcePosition: matches.index + 1,
                                      sourceLineContent: line.trim()
                                  });
                              }
                              line = line.substring(matches.index + matches[0].length);
                          }
                      });
              });
              return i18nTokens;
          })
        : Promise.resolve([]);
};

exports._.unifyTokens = function (tokenLists) {
    return tokenLists
        .reduce((acc, tokens) => acc.concat(tokens), [])
        .filter((token, index, tokens) => tokens.indexOf(token) === index);
};

exports.readTokensFromSourceCode = function (patternsByFileExt, fileNames, ignoreList) {
    return Promise.all(
        fileNames.map((fileName) => {
            let patterns = patternsByFileExt[path.extname(fileName).replace(/^\./, "")];
            return exports._.processsSourceCodeFile(patterns, fileName, ignoreList);
        })
    ).then(exports._.unifyTokens);
};

exports.readTokensFromI18n = function (destinationPattern, fileName, ignoreList) {
    return fs.readFile(fileName).then((buffer) => {
        return buffer
            .toString()
            .split("\n")
            .map((row, index) => {
                let retval = {
                    type: CONST.TOKEN.UNDEF,
                    line: row
                };
                let match = row.match(destinationPattern);
                if (match !== null) {
                    if (match[4] === "#" || ignoreList.indexOf(match[2]) > -1) {
                        retval.type = CONST.TOKEN.IGNORE;
                    } else if (match[1] === "#") {
                        retval.type = CONST.TOKEN.INACTIVE;
                    } else {
                        retval.type = CONST.TOKEN.ACTIVE;
                    }
                    retval.name = match[2];
                    retval.value = match[3];
                    retval.lineNumber = index;
                    retval.file = fileName;
                }
                return retval;
            });
    });
};

exports.readTokenFromI18nIgnore = function () {
    return fs
        .readFile(CONST.I18IGNORE)
        .then((buffer) => {
            return buffer.toString().split("\n");
        })
        .catch(() => {
            return [];
        });
};
