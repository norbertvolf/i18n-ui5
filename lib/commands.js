/* eslint-disable no-console */
"use strict";

const parseArguments = require("./argumentParser");
const sourceProcessing = require("./sourceProcessing");
const destinationProcessing = require("./destinationProcessing");
const tokenUtils = require("./tokenUtils");
const colors = require("colors/safe");
const CONST = require("./const");

exports._ = {};
exports._.processTokens = function () {
    return parseArguments
        .sourceCodeFiles()
        .then((fileNames) => {
            return sourceProcessing.readTokenFromI18nIgnore().then((tokensI18nIgnore) => {
                let tokensToIgnore, tokensArgsIgnore;

                tokensArgsIgnore = parseArguments.ignore();

                if (tokensI18nIgnore && tokensI18nIgnore.length === 0) {
                    tokensToIgnore = tokensArgsIgnore;
                } else {
                    tokensToIgnore = [...tokensI18nIgnore, ...tokensArgsIgnore];
                }

                return Promise.all([
                    sourceProcessing.readTokensFromSourceCode(parseArguments.patterns(), fileNames, tokensToIgnore),
                    sourceProcessing.readTokensFromI18n(
                        parseArguments.destinationPattern(),
                        parseArguments.destinationFile(),
                        tokensToIgnore
                    )
                ]);
            });
        })
        .then((tokens) => destinationProcessing.generateTokensFromSourceCode(tokens[0], tokens[1]));
};

exports[CONST.COMMANDS.CHECK] = function () {
    return exports._.processTokens()
        .then((generatedTokensStructureFromI18n) => {
            let numberOfChanges = tokenUtils.numberOfChanges(generatedTokensStructureFromI18n);
            let colorMessageChanges = tokenUtils.changesColor(generatedTokensStructureFromI18n);
            if (numberOfChanges) {
                tokenUtils.showChanges(generatedTokensStructureFromI18n);
                console.log(
                    colors[colorMessageChanges](
                        CONST.MESSAGES.FOUND_CHANGES.replace("{0}", numberOfChanges).replace(
                            "{1}",
                            parseArguments.destinationFile
                        )
                    )
                );
                process.exit(1);
            }
            let duplicates = tokenUtils.determineDuplicates(generatedTokensStructureFromI18n);
            if (duplicates.length) {
                console.log(colors[colorMessageChanges](CONST.MESSAGES.FOUND_DUPLICATES));
                duplicates.forEach((token) => {
                    console.log(
                        colors[CONST.COLORS.WARN](
                            CONST.MESSAGES.DUPLICATE.replace("{0}", token.line).replace("{1}", token.name)
                        )
                    );
                });
            }
            console.log(CONST.MESSAGES.NO_CHANGES.replace("{0}", parseArguments.destinationFile));
        })
        .catch((err) => {
            console.log(colors.red(err.toString()), "\n", err.stack);
        });
};

exports[CONST.COMMANDS.REPLACE] = function () {
    return exports._.processTokens()
        .then((generatedTokensStructureFromI18n) => {
            let numberOfChanges = tokenUtils.numberOfChanges(generatedTokensStructureFromI18n);
            let promise;
            if (numberOfChanges) {
                tokenUtils.showOkChanges(generatedTokensStructureFromI18n);
                tokenUtils.runOperations(generatedTokensStructureFromI18n);
                promise = destinationProcessing
                    .writeBack(generatedTokensStructureFromI18n, parseArguments.destinationFile())
                    .then(() => {
                        return CONST.MESSAGES.DESTINATION_FILE_UPDATED.replace("{0}", parseArguments.destinationFile);
                    });
            } else {
                promise = Promise.resolve(CONST.MESSAGES.NO_CHANGES.replace("{0}", parseArguments.destinationFile));
            }
            return promise;
        })
        .catch((err) => {
            console.log(colors.red(err.toString()), "\n", err.stack);
        });
};
