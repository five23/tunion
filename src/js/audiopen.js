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

var K = new kMath();
var audiopen;

window.K = K;
window.NexusUI = NexusUI;

/**
 * onload
 *
 */
window.onload = () => {
  audiopen = new AudioPen();
  if (navigator.mediaDevices) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .then((stream) => {
        audiopen.start(stream);
      })
      .catch((err) => {
        console.log(`The following gUM error occured: ${err}`);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
};

function AudioPenAPI(a) {
  var core = a;
  this.sampleRate = function () {
    return core.sampleRate;
  };
}

/**
 *
 *
 */
function AudioPen() {
  this.vco1;
  this.vco2;
  this.vco3;
  this.editor;
  this.editorToggle;
  this.analyser;
  this.analyserView;
  this.apiFunctionNames = ["process", "kMath"];
  this.isPlaying = false;
  this.compiledCode = null;
  this.lastCodeChangeTime = 0;
  this.lastCompilationTime = 0;
  this.compilationDelay = 1e3;
  this.sampleRate = 44100;
  this.bufferSize = 4096;
  this.t = 0;
}

AudioPen.prototype = {
  start: function (stream) {
    var self = this;

    this.initGui();
    this.compileCode();

    this.channelCount = 2;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.streamNode = this.audioContext.createMediaStreamSource(stream);
    this.gainNode = this.audioContext.createGain();
    this.scriptNode = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    this.streamNode.connect(this.scriptNode);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.3;
    this.scriptNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.connect(this.analyser);
    this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

    this.analyserView = new AnalyserView("view1");
    this.analyserView.initByteBuffer(this.analyser);
    this.amplitudeData = new Uint8Array(this.analyser.frequencyBinCount);
    this.mainLoop();
  },

  initGui: function () {
    var self = this;
    this.editorToggle = window.NexusUI.Add.Toggle("#header-panel");
  
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
      self.lastCodeChangeTime = Date.now();
    });
  },

  /**
   *
   *
   * @return {*}
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
    this.lastCompilationTime = Date.now();
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
   *
   *
   * @param {*} buffer
   * @return {*}
   */
  executeCode: function (audioProcessingEvent) {
    var buffer = audioProcessingEvent.outputBuffer.getChannelData(0);
    if (buffer === null) return;
    buffer = this.compiledCode.process(buffer);
  },

  /**
   *
   *
   */
  mainLoop: function () {
    var self = this;
    requestAnimationFrame(() => {
      self.mainLoop();
    });
    if (
      Date.now() - this.lastCodeChangeTime > this.compilationDelay &&
      this.lastCodeChangeTime > this.lastCompilationTime
    )
      this.compileCode();
    if (this.compiledCode.onGui) this.compiledCode.onGui();
    this.analyser.getByteTimeDomainData(this.amplitudeData);
    this.analyserView.doFrequencyAnalysis(this.analyser);
  },
};
