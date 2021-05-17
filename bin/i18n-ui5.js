#!/usr/bin/env node

"use strict";

const commands = require("../lib/commands");
const parseArguments = require("../lib/argumentParser");

commands[parseArguments.command()]();
