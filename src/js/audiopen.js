/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0nsongbook
/*----------------------------------*/

import { kMath } from "./kmath";
import { Matrix4x4 } from "./matrix4x4";
import { CameraController, shader } from "./utils3d";
import { Delay } from "../../node_modules/delay/index";
import { AnalyserView } from "./analyser";

import NexusUI from "nexusui";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";

import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

/**
 * onload
 */
window.onload = function () {
  self.NexusUI = NexusUI;
  self.K = new kMath();
  self.audiopen = new AudioPen();

  self.vco1 = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
  };

  self.vco2 = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
  };

  self.vco3 = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
  };

  self.vco4 = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
  };

  self.editorToggle = new NexusUI.Toggle("#toggle-editor", {
    size: [40, 20],
    state: false,
  });

  self.editorToggle.on("change", function (v) {
    if (v) {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm visible";
    } else {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm";
    }
  });

  //Nexus.colors.accent = "#ff0"
  //Nexus.colors.fill = "#333"

  self.view1sel = new NexusUI.Select("#view1sel", {
    size: [128, 32],
    options: ["frequency", "sonogram", "3d sonogram", "waveform"],
  });

  view1sel.on("change", function (v) {
    audiopen.analyserView.setAnalysisType(v.index);
  });

  self.vco1pos = new NexusUI.Position("#vco1pos", {
    size: [192, 192],
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco1sld = new NexusUI.Multislider("#vco1sld", {
    size: [192, 96],
    numberOfSliders: 5,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco2pos = new NexusUI.Position("#vco2pos", {
    size: [192, 192],
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco2sld = new NexusUI.Multislider("#vco2sld", {
    size: [192, 96],
    numberOfSliders: 5,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco3pos = new NexusUI.Position("#vco3pos", {
    size: [192, 192],
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco3sld = new NexusUI.Multislider("#vco3sld", {
    size: [192, 96],
    numberOfSliders: 5,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco4pos = new NexusUI.Position("#vco4pos", {
    size: [192, 192],
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco4sld = new NexusUI.Multislider("#vco4sld", {
    size: [192, 96],
    numberOfSliders: 5,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.view1 = new NexusUI.Oscilloscope("#view1", {
    size: [384, 222],
  });

  self.spec1 = new NexusUI.Spectrogram("#spec1", {
    size: [384, 222],
  });

  audiopen.start();
};

/**
 * AudioPen
 */
function AudioPen() {
  this.editor;
  this.editorToggle;
  this.analyser;
  this.analyserView = new AnalyserView({
    canvasElementID: "view1crt",
  });
  this.apiFunctionNames = ["process"];
  this.isPlaying = false;
  this.compiledCode = null;
  this.codeLastChanged = 0;
  this.codeLastCompiled = 0;
  this.compilationDelay = 1e2;
  this.sampleRate = 44100;
  this.bufferSize = 2048;
  this.t = 0;
}

AudioPen.prototype = {
  /**
   * start
   */
  start: function () {
    var self = this;

    this.initAceEditor();
    this.compileCode();

    this.channelCount = 2;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.scriptNode = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    this.analyser = this.audioContext.createAnalyser();

    this.scriptNode.connect(self.analyser);
    this.scriptNode.connect(self.audioContext.destination);

    window.view1.connect(self.scriptNode);
    window.spec1.connect(self.scriptNode);
    
    this.analyserView.initByteBuffer(self.analyser);
    this.amplitudeData = new Uint8Array(self.analyser.frequencyBinCount);

    document.body.style.visibility = "visible";

    this.mainLoop();
  },

  /**
   * initAceEditor
   */
  initAceEditor: function () {
    var self = this;

    ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setValue(`var fs = 44100; // Process Sampling Frequency
var fc = 440; // Center frequency
var z1 = 0.998; // K.lpf Filter Pole (for smoothing controller changes)

var omega = (K.TAU * fc) / fs; // Angular frequency

function process(buffer) {
  // Loop through sample buffer
  for (var t = 0; t < buffer.length; ++t) {
    vco1.step = K.lpf(vco1pos._x.value, vco1.step);
    vco1.N = K.lpf(vco1pos._y.value, vco1.N);
    vco1.theta += vco1.step;

    vco2.step = K.lpf(vco2pos._x.value, vco2.step);
    vco2.N = K.lpf(vco2pos._y.value, vco2.N);
    vco2.theta += vco2.step;

    vco3.step = K.lpf(vco3pos._x.value, vco3.step);
    vco3.N = K.lpf(vco3pos._y.value, vco3.N);
    vco3.theta += vco3.step;

    vco4.step = K.lpf(vco4pos._x.value, vco4.step);
    vco4.N = K.lpf(vco4pos._y.value, vco4.N);
    vco4.theta += vco4.step;
    
    vco1.out = 0.5 * K.sqr12(vco1.theta * omega, vco1.N);
    vco2.out = 0.5 * K.saw12(vco2.theta * omega, vco2.N);
    vco3.out = 0.5 * K.tri12(vco3.theta * omega, vco3.N);
    vco4.out = 0.5 * K.sqr12(vco4.theta * omega, vco4.N);

    buffer[t] = 0.5 * (vco1.out + vco2.out + vco3.out + vco4.out);
  }

  // Return buffer
  return buffer;
}`);
    this.editor.on("change", function (e) {
      self.codeLastChanged = Date.now();
    });
  },

  /**
   * compileCode
   *
   * @returns
   */
  compileCode: function () {
    var self = this;

    var code = self.editor.getValue();

    code += `return { process };`;

    try {
      var pack = new Function(code)();

      self.compiledCode = pack;
      self.codeLastCompiled = Date.now();

      return true;
    } catch (e) {
      console.log("Compilation failed: " + e.message + "\n" + e.stack);

      return false;
    }
  },

  /**
   * executeCode
   *
   * @param {*} audioProcessingEvent
   * @returns
   */
  executeCode: function (audioProcessingEvent) {
    var self = this;
    var buffer = audioProcessingEvent.outputBuffer.getChannelData(0);
    buffer = this.compiledCode.process(buffer);
    this.analyserView.doFrequencyAnalysis(self.analyser);
  },

  /**
   * mainLoop
   */
  mainLoop: function () {
    var self = this;
    requestAnimationFrame(() => {
      self.mainLoop();
    });
    if (
      Date.now() - this.codeLastChanged > this.compilationDelay &&
      this.codeLastChanged > this.codeLastCompiled
    ) {
      this.compileCode();
    }
  },
};
