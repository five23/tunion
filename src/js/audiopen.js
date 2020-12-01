/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0n
/*----------------------------------*/

//import { kMath } from "./kmath";
import { H } from "./harmonic";
import { AnalyserView } from "./analyser";
import { Delay } from "./delay";

import ace from "ace-builds/src-noconflict/ace";
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
    vco1.theta *= 1.00000002436537;
    vco2.theta *= 0.99999998487422;
    vco3.theta *= 1.00000003234211;
    vco4.theta *= 0.99999998234358;
  }
}`;

window.addEventListener("resize", (e) => console.log(e));

/**
 * onload
 */
window.onload = () => {
  const views = document.getElementById("views");

  self.audioCtx = audioCtx;
  self.nx = NexusUI;
  self.H = new H();
  self.out = 0;

  self.playToggle = new NexusUI.TextButton("toggle-play", {
    text: "▶",
    alternateText: "⏹",
    size: [32, 32],
  });

  if (self.audioCtx.state === "running") {
    views.style.opacity = "0.0";
    self.playToggle.state = false;
    self.audioCtx.suspend();
  }

  self.editorToggle = new NexusUI.Toggle("#toggle-editor", {
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

  self.effectsToggle = new NexusUI.Toggle("#toggle-effects", {
    size: [40, 20],
    state: false,
  });

  self.effectsToggle.on("change", (v) => {
    if (v) {
      document.getElementById("effects").className = "visible";
    } else {
      document.getElementById("effects").className = "";
    }
  });

  self.viewerToggle = new NexusUI.Toggle("#toggle-viewer", {
    size: [40, 20],
    state: false,
  });

  self.viewerToggle.on("change", (v) => {
    if (v) {
      document.getElementById("viewer").className = "visible";
    } else {
      document.getElementById("viewer").className = "";
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

  let audiopen = new AudioPen();

  self.vco1pos = audiopen.vco1pos;
  self.vco2pos = audiopen.vco2pos;
  self.vco3pos = audiopen.vco3pos;
  self.vco4pos = audiopen.vco4pos;

  self.aux0dial = audiopen.aux0dial;
  self.aux1dial = audiopen.aux1dial;
  self.aux2dial = audiopen.aux2dial;

  self.delay = audiopen.delay;

  audiopen.start();

  window.addEventListener(
    "resize",
    () => {
      audiopen.resizePositionQuad();
    },
    true
  );

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
    this.initViewer();
    this.initMidi();
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

    this.view1.connect(self.scriptNode);
    this.spec1.connect(self.scriptNode);

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
    this.editor.on("change", () => {
      self.codeLastChanged = Date.now();
    });
  }

  initViewer() {
    let self = this;

    this.view1sel =
      this.view1sel ||
      new NexusUI.Select("#view1sel", {
        size: [128, 32],
        options: ["frequency", "sonogram", "3d sonogram", "waveform"],
      });

    this.view1sel.on("change", ({ index }) => {
      self.analyserView.setAnalysisType(index);
    });

    this.view1 = new NexusUI.Oscilloscope("#view1", {
      size: [384, 222],
    });

    this.spec1 = new NexusUI.Spectrogram("#spec1", {
      size: [384, 222],
    });
  }

  initMidi() {
    let midiMessage = document.getElementById("midi");

    const onMIDIAccess = (midiAccessObject) => {
      let inputs = midiAccessObject.inputs.values();
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        input.value.onmidimessage = onMIDIMessage;
      }
    };

    const MIDItoFreq = (b, a) =>
      0 === a || (0 < a && 128 > a) ? Math.pow(2, (a - 69) / 12) * b : null;

    const onMIDIMessage = (message) => {
      let noteon = false;
      let notemsg = "0, 0";
      const note = message.data[1];
      const pressure = message.data[2];
      const frequency = MIDItoFreq(440, note);
      if (pressure) {
        noteon = true;
      }
      if (noteon) {
        notemsg = `1, ${pressure}`;
      }
      midiMessage.innerHTML = `note: ${note}, msg: ${notemsg}, freq: ${frequency}`;
    };

    const onMIDIAccessFailure = (err) => {
      console.log(
        `No MIDI devices are available, or Web MIDI isn’t supported by this browser.`
      );
      console.log(
        `Utilize Chris Wilson’s Web MIDI API Polyfill in order to use the Web MIDI API: http://cwilso.github.io/WebMIDIAPIShim/`
      );
      console.log(err);
    };

    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess({ sysex: false })
        .then(onMIDIAccess, onMIDIAccessFailure);
    } else {
      console.warn(`This browser does not support MIDI.`);
    }
  }

  initDelay() {
    this.aux0dial =
      this.aux0dial ||
      new NexusUI.Dial("#aux0dial", {
        size: [96, 96],
        interaction: "radial", // "radial", "vertical", or "horizontal"
        mode: "relative", // "absolute" or "relative"
        min: 0,
        max: 1,
        step: 0,
        value: 0,
      });

    this.aux1dial =
      this.aux1dial ||
      new NexusUI.Dial("#aux1dial", {
        size: [96, 96],
        interaction: "radial", // "radial", "vertical", or "horizontal"
        mode: "relative", // "absolute" or "relative"
        min: 0,
        max: 1,
        step: 0,
        value: 0,
      });

    this.aux2dial =
      this.aux2dial ||
      new NexusUI.Dial("#aux2dial", {
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
  resizePositionQuad() {
    const padding = 40;
    const navHeight = 32;
    const width = document.body.clientWidth - padding;
    const height = window.innerHeight - navHeight - padding;
    const quadWidth = width / 2;
    const quadHeight = height / 2;

    this.vco1pos.resize(quadWidth, quadHeight);
    this.vco2pos.resize(quadWidth, quadHeight);
    this.vco3pos.resize(quadWidth, quadHeight);
    this.vco4pos.resize(quadWidth, quadHeight);
  }
  initPositionQuad() {
    const padding = 40;
    const navHeight = 32;
    const width = document.body.clientWidth - padding;
    const height = window.innerHeight - navHeight - padding;
    const quadWidth = width / 2;
    const quadHeight = height / 2;

    this.vco1pos = new NexusUI.Position("#vco1pos", {
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

    this.vco2pos = new NexusUI.Position("#vco2pos", {
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

    this.vco3pos = new NexusUI.Position("#vco3pos", {
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

    this.vco4pos = new NexusUI.Position("#vco4pos", {
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
    // eslint-disable-next-line no-unused-vars
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
