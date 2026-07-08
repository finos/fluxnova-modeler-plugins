'use strict';

// Provide a DOM (document, window, KeyboardEvent, requestAnimationFrame, ...)
// for the provider specs that touch the properties panel / overlays.
require('jsdom-global')();

const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
