/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0n
/*----------------------------------*/

//import { kMath } from "./kmath";
import { H } from "./harmonic";
import { AnalyserView } from "./analyser";
import { Delay } from "./delay";

import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";

import NexusUI from "nexusui";

import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {    
    delay.d0 = H.lpf(aux0dial.value, delay.d0);               // Delay amplitude
    delay.d1 = H.lpf(aux1dial.value * 0.99 + 0.01, delay.d1); // Delay feedback        
    delay.d2 = H.lpf(aux2dial.value * 16000 + 162, delay.d2); // Delay time
    
    vco1.step = H.lpf(vco1pos._x.value, vco1.step);
    vco1.N = H.lpf(vco1pos._y.value, vco1.N);
    vco1.theta += vco1.step;

    vco2.step = H.lpf(vco2pos._x.value, vco2.step);
    vco2.N = H.lpf(vco2pos._y.value, vco2.N);
    vco2.theta += vco2.step;

    vco3.step = H.lpf(vco3pos._x.value, vco3.step);
    vco3.N = H.lpf(vco3pos._y.value, vco3.N);
    vco3.theta += vco3.step;

    vco4.step = H.lpf(vco4pos._x.value, vco4.step);
    vco4.N = H.lpf(vco4pos._y.value, vco4.N);
    vco4.theta += vco4.step;
    
    vco1.out = H.sqr12(vco1.theta, vco1.N);
    vco2.out = H.saw12(vco2.theta, vco2.N);
    vco3.out = H.tri12(vco3.theta, vco3.N);
    vco4.out = H.sqr12(vco4.theta, vco4.N);
    
    out = 0.25 * (vco1.out + vco2.out + vco3.out + vco4.out);
    
    delay.dO = delay.d0 * delay.feedback(delay.d1).delay(delay.d2).run(out);
    
    buffer[t] = 0.5 * (out + delay.dO);

    // drift
    vco1.theta *= 1.00000001;
    vco2.theta *= 0.99999998;
    vco3.theta *= 1.00000001;
    vco4.theta *= 0.99999998;
  }
}`;

/**
 * onload
 */
window.onload = () => {
  const views = document.getElementById("views");

  self.audioCtx = audioCtx;
  self.nx = NexusUI;
  self.H = new H();
  self.out = 0;

  self.playToggle = new nx.TextButton("toggle-play", {
    text: "▶",
    alternateText: "⏹",
    size: [32, 32],
  });

  if (self.audioCtx.state === "running") {
    views.style.opacity = "0.0";
    self.playToggle.state = false;
    self.audioCtx.suspend();
  }

  self.editorToggle = new nx.Toggle("#toggle-editor", {
    size: [40, 20],
    state: false,
  });

  self.editorToggle.on("change", (v) => {
    if (v) {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm visible";
    } else {
      document.getElementById("editor").className =
        "ace_editor ace_hidpi ace-tm";
    }
  });

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

  self.view1sel = new nx.Select("#view1sel", {
    size: [128, 32],
    options: ["frequency", "sonogram", "3d sonogram", "waveform"],
  });

  view1sel.on("change", ({ index }) => {
    audiopen.analyserView.setAnalysisType(index);
  });

  self.view1 = new nx.Oscilloscope("#view1", {
    size: [384, 222],
  });

  self.spec1 = new nx.Spectrogram("#spec1", {
    size: [384, 222],
  });

  let audiopen = new AudioPen();

  window.audiopen = audiopen;  
  window.vco1pos = audiopen.vco1pos;
  window.vco2pos = audiopen.vco2pos;  
  window.vco3pos = audiopen.vco3pos;
  window.vco4pos = audiopen.vco4pos;

  window.aux0dial = audiopen.aux0dial;
  window.aux1dial = audiopen.aux1dial;
  window.aux2dial = audiopen.aux2dial;

  window.delay = self.audiopen.delay;

  self.audiopen.start();

  self.playToggle.on("change", (v) => {
    if (v) {
      if (self.audioCtx.state === "suspended") {
        self.audioCtx.resume();
      }
      views.style.opacity = "1.0";
    } else {
      if (self.audioCtx.state === "running") {
        self.audioCtx.suspend();
      }
      views.style.opacity = "0.0";
    }
  });
};

/**
 * AudioPen
 */
class AudioPen {
  constructor() {
    this.initDelay();
    this.initPositionQuad();
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
    this.compilationDelay = 1e3;
    this.sampleRate = 44100;
    this.bufferSize = 2048;
    this.t = 0;
  }

  /**
   * start
   */
  start() {
    const self = this;

    this.audioCtx = window.audioCtx;

    this.initEditor();
    this.compileCode();

    this.channelCount = 2;

    this.gainNode = this.audioCtx.createGain();
    this.scriptNode = this.audioCtx.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    this.analyser = this.audioCtx.createAnalyser();

    this.scriptNode.connect(self.analyser);
    this.scriptNode.connect(self.audioCtx.destination);

    window.view1.connect(self.scriptNode);
    window.spec1.connect(self.scriptNode);

    this.analyserView.initByteBuffer(self.analyser);
    this.amplitudeData = new Uint8Array(self.analyser.frequencyBinCount);

    document.body.style.visibility = "visible";

    this.mainLoop();
  }

  /**
   * initEditor
   */
  initEditor() {
    const self = this;

    ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.setValue(defaultRack, -1);
    this.editor.on("change", (e) => {      
      self.codeLastChanged = Date.now();
    });
  }

  initDelay() {

    this.aux0dial = this.aux0dial || new nx.Dial("#aux0dial", {
      size: [96, 96],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 0,
      max: 1,
      step: 0,
      value: 0,
    });
  
    this.aux1dial = this.aux1dial || new nx.Dial("#aux1dial", {
      size: [96, 96],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 0,
      max: 1,
      step: 0,
      value: 0,
    });
  
    this.aux2dial = this.aux2dial || new nx.Dial("#aux2dial", {
      size: [96, 96],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 0,
      max: 1,
      step: 0,
      value: 0,
    });
  
    this.delayOut = 0;
    this.delay = Delay(16384);
  }
  initPositionQuad() {

    let rack = document.getElementsByClassName("rack")[0];

    const padding = 20;    
    const navHeight = 32;
    const width = document.body.clientWidth;
    const height = window.innerHeight - navHeight;
    const quadWidth = width/2;
    const quadHeight = height/2;

    console.log(quadWidth);

    this.vco1pos = this.vco1pos || new nx.Position("#vco1pos", {
      size: [quadWidth, quadHeight],
      x: 0.0,
      minX: 0,
      maxX: 1,
      stepX: 0.00001,
      y: 0.0,
      minY: 0,
      maxY: 1,
      stepY: 0.00001,
    });

    this.vco2pos = this.vco2pos || new nx.Position("#vco2pos", {
      size: [quadWidth, quadHeight],
      x: 0.0,
      minX: 0,
      maxX: 1,
      stepX: 0.00001,
      y: 0.0,
      minY: 0,
      maxY: 1,
      stepY: 0.00001,
    });

    this.vco3pos = this.vco3pos || new nx.Position("#vco3pos", {
      size: [quadWidth, quadHeight],
      x: 0.0,
      minX: 0,
      maxX: 1,
      stepX: 0.00001,
      y: 0.0,
      minY: 0,
      maxY: 1,
      stepY: 0.00001,
    });

    this.vco4pos = this.vco4pos || new nx.Position("#vco4pos", {
      size: [quadWidth, quadHeight],
      x: 0.0,
      minX: 0,
      maxX: 1,
      stepX: 0.00001,
      y: 0.0,
      minY: 0,
      maxY: 1,
      stepY: 0.00001,
    });
  }

  /**
   * compileCode
   *
   * @returns
   */
  compileCode() {
    const self = this;

    let code = self.editor.getValue();

    code += `return { process };`;

    try {
      const pack = new Function(code)();

      self.compiledCode = pack;
      self.codeLastCompiled = Date.now();

      return true;
    } catch (e) {
      console.log(`Compilation failed: ${e.message}\n${e.stack}`);

      return false;
    }
  }

  /**
   * executeCode
   *
   * @param {*} audioProcessingEvent
   * @returns
   */
  executeCode({ outputBuffer }) {
    const self = this;
    let buffer = outputBuffer.getChannelData(0);
    buffer = this.compiledCode.process(buffer);
    this.analyserView.doFrequencyAnalysis(self.analyser);
  }

  /**
   * mainLoop
   */
  mainLoop() {
    const self = this;
    requestAnimationFrame(() => {
      self.mainLoop();
    });
    if (
      Date.now() - this.codeLastChanged > this.compilationDelay &&
      this.codeLastChanged > this.codeLastCompiled
    ) {
      this.compileCode();
    }
  }
}
