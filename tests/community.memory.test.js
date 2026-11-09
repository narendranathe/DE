'use strict';
const contract = require('./community.contract.js');
const { makeWorld } = require('../tools/dev/memory-community.js');
contract('memory adapter meets the community contract', async () => makeWorld());
