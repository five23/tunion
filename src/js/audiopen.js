/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0nsongbook
/*----------------------------------*/

import { kMath } from "./kmath";
import { Matrix4x4 } from "./matrix4x4";
import { CameraController, shader } from "./utils3d";
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
    values: [0.0, 0.2, 0.2, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1],
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
    this.editor.setValue(`var out = 0;
    var delayOut = 0;
    var delay = Delay(16384);
    
    var d0 = 0;
    var d1 = 0;
    var d2 = 0;
    var dO = 0;
    
    function process(buffer) {  
      for (var t = 0; t < buffer.length; ++t) {
          
        d0 = K.lpf(vco1sld.values[0], d0);               // Delay amplitude
        d1 = K.lpf(vco1sld.values[1] * 0.99 + 0.01, d1); // Delay feedback        
        d2 = K.lpf(vco1sld.values[2] * 16000 + 383, d2); // Delay time
        
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
        
        vco1.out = 0.5 * K.sqr12(vco1.theta, vco1.N += K.OMEGA * vco4.out * vco1sld.values[4]);
        vco2.out = 0.5 * K.saw12(vco2.theta, vco2.N -= K.OMEGA * vco1.out * vco2sld.values[4]);
        vco3.out = 0.5 * K.tri12(vco3.theta, vco3.N += K.OMEGA * vco2.out * vco3sld.values[4]);
        vco4.out = 0.5 * K.sqr12(vco4.theta, vco4.N -= K.OMEGA * vco3.out * vco4sld.values[4]);
        
        out = 0.5 * (vco1.out + vco2.out + vco3.out + vco4.out);
        
        dO = d0 * delay.feedback(d1).delay(d2).run(out);
        
        buffer[t] = (out + dO);
      }
    }
    
    
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
    };`);
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
