"use strict";

var _ace = _interopRequireDefault(require("ace-builds/src-noconflict/ace"));

var _harmonic = require("./harmonic");

var _analyser = require("./analyser");

var _delay = require("./delay");

require("ace-builds/src-noconflict/mode-javascript");

var _workerJavascript = _interopRequireDefault(require("file-loader!ace-builds/src-noconflict/worker-javascript"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* ----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ tuni0n
/*----------------------------------*/
// import { kMath } from "./kmath";
// import { initMidi } from "./midi";
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var H = new _harmonic.Harmonic();
var defaultRack = "function process(buffer) {  \n  for (var t = 0; t < buffer.length; ++t) {    \n    audiopen.processTheta();\n\n    vco1.out = H.sqr12(vco1.theta, vco1.N + vco1.feedback);\n    vco2.out = H.saw12(vco2.theta, vco2.N + vco2.feedback);\n    vco3.out = H.revsaw12(vco3.theta, vco3.N + vco3.feedback);\n    vco4.out = H.tri12(vco4.theta, vco4.N - vco4.feedback);\n    \n    audiopen.processFeedbackMatrix();\n    audiopen.processVcoGain();\n\n    out = 0.25 * (vco1.gain * vco1.out + vco2.gain * vco2.out + vco3.gain * vco3.out + vco4.gain * vco4.out);\n    \n    const delayOut = delay.gain(d0gain.value).feedback(d0feedback.value).time(d0time.value).run(out);\n\n    buffer[t] = 0.5 * (out + delayOut);\n\n    audiopen.processDrift();\n  }\n}";
/**
 * onload
 */

window.onload = function () {
  var audiopen = new Audiopen();
  self.audiopen = audiopen;
  self.out = 0;
  self.H = H;
  self.delay = audiopen.delay;
  self.d0gain = audiopen.d0gain;
  self.d0feedback = audiopen.d0feedback;
  self.d0time = audiopen.d0time;
  var vcoCtrl = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
    gain: 1,
    vco1: 0,
    vco2: 0,
    vco3: 0,
    vco4: 0,
    feedback: 0
  };
  self.vco1 = Object.assign(audiopen.vco1, vcoCtrl);
  self.vco2 = Object.assign(audiopen.vco2, vcoCtrl);
  self.vco3 = Object.assign(audiopen.vco3, vcoCtrl);
  self.vco4 = Object.assign(audiopen.vco4, vcoCtrl);
  audiopen.start();
  self.addEventListener('resize', function () {
    return audiopen.resizePositionQuad();
  }, true);
};