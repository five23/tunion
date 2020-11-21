/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0n
/*----------------------------------*/

import { kMath } from "./kmath";
import { Matrix4x4 } from "./matrix4x4";
import { CameraController, shader } from "./utils3d";
import { AnalyserView } from "./analyser";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";

import NexusUI from "nexusui";

import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

/**
 * onload
 */
window.onload = function () {
  
  var AudioContext = window.AudioContext || window.webkitAudioContext;

  self.audioContext = new AudioContext();

  self.defaultRack = `/**
 * uni0n!.
 */
function process(buffer) {
    
  for (var t = 0; t < buffer.length; ++t) {
    
    vco1.theta *= 1.00000001;
    vco2.theta *= 0.99999998;
    vco3.theta *= 1.00000001;
    vco4.theta *= 0.99999998;
    
    d0 = K.lpf(aux0dial.value, d0);               // Delay amplitude
    d1 = K.lpf(aux1dial.value * 0.99 + 0.01, d1); // Delay feedback        
    d2 = K.lpf(aux2dial.value * 16000 + 162, d2); // Delay time
    
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
    
    vco1.out = K.sqr12(vco1.theta, vco1.N);
    vco2.out = K.saw12(vco2.theta, vco2.N);
    vco3.out = K.tri12(vco3.theta, vco3.N);
    vco4.out = K.sqr12(vco4.theta, vco4.N);
    
    out = 0.25 * (vco1.out + vco2.out + vco3.out + vco4.out);
    
    dO = d0 * delay.feedback(d1).delay(d2).run(out);
    
    buffer[t] = 0.5 * (out + dO);
  }
}`;

  self.out = 0;
  self.d0 = 0;
  self.d1 = 0;
  self.d2 = 0;
  self.dO = 0;

  self.nx = NexusUI;
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

  self.editorToggle = new nx.Toggle("#toggle-editor", {
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

  self.view1sel = new nx.Select("#view1sel", {
    size: [128, 32],
    options: ["frequency", "sonogram", "3d sonogram", "waveform"],
  });

  view1sel.on("change", function (v) {
    audiopen.analyserView.setAnalysisType(v.index);
  });

  self.vco1pos = new nx.Position("#vco1pos", {
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

  self.vco1sld = new nx.Multislider("#vco1sld", {
    size: [192, 192],
    numberOfSliders: 4,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0,0,0,0],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco2pos = new nx.Position("#vco2pos", {
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

  self.vco2sld = new nx.Multislider("#vco2sld", {
    size: [192, 192],
    numberOfSliders: 4,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0,0,0,0],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco3pos = new nx.Position("#vco3pos", {
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

  self.vco3sld = new nx.Multislider("#vco3sld", {
    size: [192, 192],
    numberOfSliders: 4,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0,0,0,0],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.vco4pos = new nx.Position("#vco4pos", {
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

  self.vco4sld = new nx.Multislider("#vco4sld", {
    size: [192, 192],
    numberOfSliders: 4,
    min: 0,
    max: 1,
    step: 0,
    candycane: 3,
    values: [0,0,0,0],
    smoothing: 0,
    mode: "bar", // 'bar' or 'line'
  });

  self.view1 = new nx.Oscilloscope("#view1", {
    size: [384, 222],
  });

  self.spec1 = new nx.Spectrogram("#spec1", {
    size: [384, 222],
  });

  self.aux0dial = new nx.Dial("#aux0dial", {
    size: [96, 96],
    interaction: "radial", // "radial", "vertical", or "horizontal"
    mode: "relative", // "absolute" or "relative"
    min: 0,
    max: 1,
    step: 0,
    value: 0,
  });

  self.aux1dial = new nx.Dial("#aux1dial", {
    size: [96, 96],
    interaction: "radial", // "radial", "vertical", or "horizontal"
    mode: "relative", // "absolute" or "relative"
    min: 0,
    max: 1,
    step: 0,
    value: 0,
  });

  self.aux2dial = new nx.Dial("#aux2dial", {
    size: [96, 96],
    interaction: "radial", // "radial", "vertical", or "horizontal"
    mode: "relative", // "absolute" or "relative"
    min: 0,
    max: 1,
    step: 0,
    value: 0,
  });

  // Delay (via opendsp)
  function Delay(size) {
    if (!(this instanceof Delay)) return new Delay(size);
    size = size || 16384;
    this.buffer = new Float32Array(size);
    this.size = size;
    this.counter = 0;
    this._feedback = 0.5;
    this._delay = 16384;
  }

  Delay.prototype.feedback = function (n) {
    this._feedback = n;
    return this;
  };

  Delay.prototype.delay = function (n) {
    this._delay = n;
    return this;
  };

  Delay.prototype.run = function (inp) {
    var back = this.counter - this._delay;
    if (back < 0) back = this.size + back;
    var index0 = Math.floor(back);

    var index_1 = index0 - 1;
    var index1 = index0 + 1;
    var index2 = index0 + 2;

    if (index_1 < 0) index_1 = this.size - 1;
    if (index1 >= this.size) index1 = 0;
    if (index2 >= this.size) index2 = 0;

    var y_1 = this.buffer[index_1];
    var y0 = this.buffer[index0];
    var y1 = this.buffer[index1];
    var y2 = this.buffer[index2];

    var x = back - index0;

    var c0 = y0;
    var c1 = 0.5 * (y1 - y_1);
    var c2 = y_1 - 2.5 * y0 + 2.0 * y1 - 0.5 * y2;
    var c3 = 0.5 * (y2 - y_1) + 1.5 * (y0 - y1);

    var out = ((c3 * x + c2) * x + c1) * x + c0;

    this.buffer[this.counter] = inp + out * this._feedback;

    this.counter++;

    if (this.counter >= this.size) this.counter = 0;

    return out;
  };

  self.delayOut = 0;
  self.delay = Delay(16384);

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

    this.audioContext = window.audioContext;
    
    this.initAceEditor();
    this.compileCode();

    this.channelCount = 2;
  
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
    this.editor.setValue(defaultRack, -1);
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
