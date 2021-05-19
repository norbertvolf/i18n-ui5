"use strict";

const fs = require("fs/promises");
const path = require("path");
const CONST = require("./const");

exports._ = {};

exports._.processsSourceCodeFile = function (patterns, fileName, ignoreList) {
    return Array.isArray(patterns) && typeof fileName === "string"
        ? fs.readFile(fileName).then((buffer) => {
              let matches;
              let content;
              let i18nTokens = [];
              patterns.forEach(function (pattern) {
                  content = buffer.toString();
                  for (matches = content.match(pattern); matches; matches = content.match(pattern)) {
                      if (ignoreList.indexOf(matches[1].toString()) < 0) {
                          i18nTokens.push(matches[1].toString());
                      }
                      content = content.substring(matches.index + matches[0].length);
                  }
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
            .map((row) => {
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
                }
                return retval;
            });
    });
};
