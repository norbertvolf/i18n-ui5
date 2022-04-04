"use strict";

let patterns = {
    xml: [/'i18n>([^']+)'/, /\{i18n>([^}]+)\}/, /\{@i18n>(@[^}]+)\}/],
    json: [/\{\{([^}]+)\}\}/, /\{@i18n>([^}]+)\}/],
    js: [/(?:getText|__)\(["']([^"']+)["']/, /(?:nGetText)\(["']([^"']+)["'], *["']([^"']+)["']/, /\{i18n>([^}]+)\}/]
};

exports.COMMANDS = {
    CHECK: "check",
    REPLACE: "replace"
};

exports.DEFAULTS = {
    globs: ["./**/*.xml", "./**/*.html", "./**/*.json", "./**/*.js"],
    processNodeModules: false,
    command: exports.COMMANDS.CHECK,
    replace: false,
    destinationFile: "webapp/i18n/i18n.properties",
    destinationPattern: /^(#*)([^= ]+) *= *([^#]*)(#*)/,
    patterns: Object.assign(
        {
            html: patterns.xml
        },
        patterns
    )
};

exports.TOKEN = {
    UNDEF: "undef",
    INACTIVE: "inactive",
    ACTIVE: "active",
    IGNORE: "ignore"
};

exports.OPERATION = {
    ADD: "+",
    ACTIVATE: "~",
    DEACTIVATE: "-"
};

exports.OPERATION_LIST = [exports.OPERATION.ADD, exports.OPERATION.ACTIVATE, exports.OPERATION.DEACTIVATE];

exports.COLORS = {
    WARN: "yellow",
    ERROR: "red",
    OK: "green"
};

exports.OPERATION_COLORS = {};
exports.OPERATION_COLORS[exports.OPERATION.ADD] = exports.COLORS.ERROR;
exports.OPERATION_COLORS[exports.OPERATION.ACTIVATE] = exports.COLORS.WARN;
exports.OPERATION_COLORS[exports.OPERATION.DEACTIVATE] = exports.COLORS.WARN;
exports.OPERATION_COLORS[exports.OPERATION.DEACTIVATE] = exports.COLORS.OK;

exports.OPERATION_MESSAGES = {};
exports.OPERATION_MESSAGES[exports.OPERATION.ADD] = "Missing token {0} in translation file.";
exports.OPERATION_MESSAGES[exports.OPERATION.ACTIVATE] = "Token {0} can be activated.";
exports.OPERATION_MESSAGES[exports.OPERATION.DEACTIVATE] = "Token {0} can be deactivated.";

exports.OPERATION_OK_MESSAGES = {};
exports.OPERATION_OK_MESSAGES[exports.OPERATION.ADD] = "Adding token {0}";
exports.OPERATION_OK_MESSAGES[exports.OPERATION.ACTIVATE] = "Activate token {0}";
exports.OPERATION_OK_MESSAGES[exports.OPERATION.DEACTIVATE] = "Deactivate token {0}.";

exports.MESSAGES = {
    NO_CHANGES: "\nAll tokens from matched files exists in {0}.",
    FOUND_CHANGES: "\nFound {0} differences between tokens in source code and {1}!",
    DESTINATION_FILE_UPDATED: "\nDestination file {0} has been updated!"
};
