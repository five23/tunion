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

  self.view1sel = new NexusUI.Select('#view1sel',{
    'size': [100, 30],
    'options': ['freq','sono', '3dsono', 'wave']
  });

  view1sel.on('change', function(v) {
    audiopen.analyserView.setAnalysisType(v.index);
  })

  self.vco1pos = new NexusUI.Position("#vco4pos", {
    size: [122, 122],    
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco2pos = new NexusUI.Position("#vco4pos", {
    size: [122, 122],    
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco3pos = new NexusUI.Position("#vco4pos", {
    size: [122, 122],    
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco4pos = new NexusUI.Position("#vco4pos", {
    size: [122, 122],    
    x: 0.0,
    minX: 0,
    maxX: 1,
    stepX: 0.00001,
    y: 0.0,
    minY: 0,
    maxY: 1,
    stepY: 0.00001,
  });

  self.vco1sld = new NexusUI.Multislider('#vco1sld',{
    'size': [122, 61],
    'numberOfSliders': 4,
    'min': 0,
    'max': 1,
    'step': 0,
    'candycane': 3,
    'values': [0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1],
    'smoothing': 0,
    'mode': 'bar'  // 'bar' or 'line'
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
    canvasElementID: "view1crt"
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

    this.initRack();
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
    this.analyserView.initByteBuffer(self.analyser);
    this.amplitudeData = new Uint8Array(self.analyser.frequencyBinCount);
    this.mainLoop();
  },

  /**
   * initRack
   */
  initRack: function () {
    var self = this;

    this.editorToggle = NexusUI.Add.Toggle("#header-panel");
    
    this.editorToggle.on("change", function (v) {
      if (v) {
        document.getElementById("editor").className =
          "ace_editor ace_hidpi ace-tm visible";
      } else {
        document.getElementById("editor").className =
          "ace_editor ace_hidpi ace-tm";
      }
    });

    ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
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
    var code = this.editor.getValue();
    var memberDefs = [];
    for (var i = 0; i < this.apiFunctionNames.length; ++i) {
      var fname = this.apiFunctionNames[i];
      memberDefs.push(
        fname + ":(typeof " + fname + "=='function'?" + fname + ":null)"
      );
    }
    var appendix = "\nreturn {" + memberDefs.join(",") + " };";
    code += appendix;
    this.codeLastCompiled = Date.now();
    var pack = null;
    try {
      pack = new Function(code)();
    } catch (ex) {
      console.log("Compilation failed: " + ex.message + "\n" + ex.stack);
      return false;
    }
    this.compiledCode = pack;
    return true;
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
