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
import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

import NexusUI from "nexusui";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {
    
    vco1.step = H.lpf(vco1._x.value, vco1.step);
    vco1.N = H.lpf(vco1._y.value, vco1.N);
    vco1.theta += vco1.step;

    vco2.step = H.lpf(vco2._x.value, vco2.step);
    vco2.N = H.lpf(vco2._y.value, vco2.N);
    vco2.theta += vco2.step;

    vco3.step = H.lpf(vco3._x.value, vco3.step);
    vco3.N = H.lpf(vco3._y.value, vco3.N);
    vco3.theta += vco3.step;

    vco4.step = H.lpf(vco4._x.value, vco4.step);
    vco4.N = H.lpf(vco4._y.value, vco4.N);
    vco4.theta += vco4.step;
    
    vco1.out = H.sqr12(vco1.theta, vco1.N + vco1.feedback);
    vco2.out = H.saw12(vco2.theta, vco2.N + vco2.feedback);
    vco3.out = H.revsaw12(vco3.theta, vco3.N + vco3.feedback);
    vco4.out = H.tri12(vco4.theta, vco4.N - vco4.feedback);
    
    out = 0.25 * (vco1.out + vco2.out + vco3.out + vco4.out);
    
    audiopen.processFeedbackMatrix();
    audiopen.processDrift();
    
    const delayOut = delay.gain(d0gain.value).feedback(d0feedback.value).time(d0time.value).run(out);

    buffer[t] = 0.5 * (out + delayOut);    
  }
}`;

/**
 * onload
 */
window.onload = () => {
  let audiopen = new AudioPen();

  self.audiopen = audiopen;
  self.out = 0;
  self.H = audiopen.H;

  self.delay = audiopen.delay;

  self.d0gain = audiopen.d0gain;
  self.d0feedback = audiopen.d0feedback;
  self.d0time = audiopen.d0time;

  let vcoCtrl = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
    vco1: 0,
    vco2: 0,
    vco3: 0,
    vco4: 0,
    feedback: 0,
  };

  self.vco1 = Object.assign(audiopen.vco1, vcoCtrl);
  self.vco2 = Object.assign(audiopen.vco2, vcoCtrl);
  self.vco3 = Object.assign(audiopen.vco3, vcoCtrl);
  self.vco4 = Object.assign(audiopen.vco4, vcoCtrl);

  audiopen.start();

  self.addEventListener("resize", () => audiopen.resizePositionQuad(), true);
};

/**
 * AudioPen
 *
 * @class AudioPen
 */
class AudioPen {
  constructor() {
    this.vis = document.getElementsByClassName("vis")[0];
    this.glvis = document.getElementsByClassName("glvis")[0];
    this.editor = document.getElementsByClassName("editor")[0];
    this.effects = document.getElementsByClassName("effects")[0];
    this.feedback = document.getElementsByClassName("feedback")[0];

    this.H = new H();
    this.audioCtx = audioCtx;

    this.initDelay();
    this.initFeedback();
    this.initPositionQuad();
    this.initVis();
    this.initMidi();

    this.view1crt = document.getElementById("view1crt");
    this.view1crt.width = 800;
    this.view1crt.height = 400;
    this.analyserView = new AnalyserView(this.view1crt);
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
   *
   * @memberof AudioPen
   */
  start() {
    const self = this;

    this.initEditor();
    this.initToggles();
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
   *
   * @memberof AudioPen
   */
  initEditor() {
    const self = this;

    ace.config.setModuleUrl("ace/mode/javascript_worker", jsWorkerUrl);

    this.aceEditor = ace.edit("ace-editor");
    this.aceEditor.setShowPrintMargin(false);
    this.aceEditor.getSession().setMode("ace/mode/javascript");
    this.aceEditor.setValue(defaultRack, -1);
    this.aceEditor.on("change", () => {
      self.codeLastChanged = Date.now();
    });
  }

  /**
   * initToggles
   *
   * @memberof AudioPen
   */
  initToggles() {
    let self = this;

    this.initPlayToggle(self);
    this.initEditorToggle(self);
    this.initEffectsToggle(self);
    this.initFeedbackToggle(self);
    this.initVisToggle(self);
    this.initGlvisToggle(self);
  }

  initVisToggle(self) {
    this.visToggle = new NexusUI.Toggle("#toggle-vis", {
      size: [40, 20],
      state: false,
    });

    this.visToggle.on("change", (v) => {
      if (v) {
        self.vis.className = "vis visible";
      } else {
        self.vis.className = "vis";
      }
    });
  }

  initGlvisToggle(self) {
    this.glvisToggle = new NexusUI.Toggle("#toggle-glvis", {
      size: [40, 20],
      state: false,
    });

    this.glvisToggle.on("change", (v) => {
      if (v) {
        self.glvis.className = "glvis visible";
      } else {
        self.glvis.className = "glvis";
      }
    });
  }

  initEffectsToggle(self) {
    this.effectsToggle = new NexusUI.Toggle("#toggle-effects", {
      size: [40, 20],
      state: false,
    });

    this.effectsToggle.on("change", (v) => {
      if (v) {
        self.effects.className = "effects visible";
      } else {
        self.effects.className = "effects";
      }
    });
  }

  initFeedbackToggle(self) {
    this.feedbackToggle = new NexusUI.Toggle("#toggle-feedback", {
      size: [40, 20],
      state: false,
    });

    this.feedbackToggle.on("change", (v) => {
      if (v) {
        self.feedback.className = "feedback visible";
      } else {
        self.feedback.className = "feedback";
      }
    });
  }

  initEditorToggle(self) {
    this.editorToggle = new NexusUI.Toggle("#toggle-editor", {
      size: [40, 20],
      state: false,
    });

    this.editorToggle.on("change", (v) => {
      if (v) {
        self.editor.className = "editor visible";
      } else {
        self.editor.className = "editor";
      }
    });
  }

  initPlayToggle(self) {
    this.playToggle = new NexusUI.TextButton("toggle-play", {
      text: "▶",
      alternateText: "⏹",
      size: [32, 32],
    });

    this.playToggle.on("change", (v) => {
      if (v) {
        if (self.audioCtx.state === "suspended") {
          self.audioCtx.resume();
        }
      } else {
        if (self.audioCtx.state === "running") {
          self.audioCtx.suspend();
        }
      }
    });

    if (this.audioCtx.state === "running") {
      self.playToggle.state = false;
      self.audioCtx.suspend();
    }
  }

  /**
   * initVis
   *
   * @memberof AudioPen
   */
  initVis() {
    let self = this;

    this.view1sel =
      this.view1sel ||
      new NexusUI.Select("#view1sel", {
        size: [800, 28],
        options: ["frequency", "sonogram", "3d sonogram", "waveform"],
      });

    this.view1sel.on("change", ({ index }) => {
      self.analyserView.setAnalysisType(index);
    });

    this.view1 = new NexusUI.Oscilloscope("#view1", {
      size: [800, 280],
    });

    this.spec1 = new NexusUI.Spectrogram("#spec1", {
      size: [800, 280],
    });
  }

  /**
   * Initialize MIDI stuff
   *
   * @memberof AudioPen
   */
  initMidi() {
    /** @type {*} */
    let midiMessage = document.getElementById("midi");

    /**
     * onMIDIAccess
     *
     * @param {*} midiAccessObject
     */
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

    /**
     * Convert MIDI note # to frequency in hertz
     *
     * @param {Number} b
     * @param {Number} a
     */
    const MIDItoFreq = (b, a) =>
      0 === a || (0 < a && 128 > a) ? 2 ** ((a - 69) / 12) * b : null;

    /**
     * onMIDIMessage
     *
     * @param {*} message
     */
    const onMIDIMessage = ({ data }) => {
      let noteon = false;
      let notemsg = "0, 0";
      const note = data[1];
      const pressure = data[2];
      const frequency = MIDItoFreq(440, note);
      if (pressure) {
        noteon = true;
      }
      if (noteon) {
        notemsg = `1, ${pressure}`;
      }
      midiMessage.innerHTML = `note: ${note}, msg: ${notemsg}, freq: ${frequency}`;
    };

    /**
     * onMIDIAccessFailure
     *
     * @param {*} err
     */
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

  /**
   * initFeedback
   *
   * @memberof AudioPen
   */
  initFeedback() {
    this.vco1mat = new NexusUI.Multislider("#vco1mat", {
      size: [128, 128],
      numberOfSliders: 4,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0],
      smoothing: 0,
      mode: "bar",
    });

    this.vco2mat = new NexusUI.Multislider("#vco2mat", {
      size: [128, 128],
      numberOfSliders: 4,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0],
      smoothing: 0,
      mode: "bar",
    });

    this.vco3mat = new NexusUI.Multislider("#vco3mat", {
      size: [128, 128],
      numberOfSliders: 4,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0],
      smoothing: 0,
      mode: "bar",
    });

    this.vco4mat = new NexusUI.Multislider("#vco4mat", {
      size: [128, 128],
      numberOfSliders: 4,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0],
      smoothing: 0,
      mode: "bar",
    });
  }


  /**
   * processDrift
   *
   * @memberof AudioPen
   */
  processDrift() {
    this.vco1.theta *= 1.00000002;
    this.vco2.theta *= 0.99999998;
    this.vco3.theta *= 1.00000003;
    this.vco4.theta *= 0.99999999;
  }


  /**
   * processFeedbackMatrix
   *
   * @memberof AudioPen
   */
  processFeedbackMatrix() {
    let self = this;

    this.vco1.vco1 = 0.5 * (self.vco1mat.values[0] * this.vco1.out);
    this.vco1.vco2 = 0.5 * (self.vco1mat.values[1] * this.vco2.out);
    this.vco1.vco3 = 0.5 * (self.vco1mat.values[2] * this.vco3.out);
    this.vco1.vco4 = 0.5 * (self.vco1mat.values[3] * this.vco4.out);

    this.vco1.feedback =
      this.vco1.vco1 + this.vco1.vco2 + this.vco1.vco3 + this.vco1.vco4;

    this.vco2.vco1 = 0.5 * (self.vco2mat.values[0] * this.vco1.out);
    this.vco2.vco2 = 0.5 * (self.vco2mat.values[1] * this.vco2.out);
    this.vco2.vco3 = 0.5 * (self.vco2mat.values[2] * this.vco3.out);
    this.vco2.vco4 = 0.5 * (self.vco2mat.values[3] * this.vco4.out);

    this.vco2.feedback =
      this.vco2.vco2 + this.vco2.vco1 + this.vco2.vco3 + this.vco2.vco4;

    this.vco3.vco1 = 0.5 * (self.vco3mat.values[0] * this.vco1.out);
    this.vco3.vco2 = 0.5 * (self.vco3mat.values[1] * this.vco2.out);
    this.vco3.vco3 = 0.5 * (self.vco3mat.values[2] * this.vco3.out);
    this.vco3.vco4 = 0.5 * (self.vco3mat.values[3] * this.vco4.out);

    this.vco3.feedback =
      this.vco3.vco1 + this.vco3.vco2 + this.vco3.vco3 + this.vco3.vco4;

    this.vco4.vco1 = 0.5 * (self.vco4mat.values[0] * this.vco1.out);
    this.vco4.vco2 = 0.5 * (self.vco4mat.values[1] * this.vco2.out);
    this.vco4.vco3 = 0.5 * (self.vco4mat.values[2] * this.vco3.out);
    this.vco4.vco4 = 0.5 * (self.vco4mat.values[3] * this.vco4.out);

    this.vco4.feedback =
      this.vco4.vco2 + this.vco4.vco1 + this.vco4.vco3 + this.vco4.vco4;
  }

  /**
   * initDelay
   *
   * @memberof AudioPen
   */
  initDelay() {
    this.d0gain = new NexusUI.Dial("#d0gain", {
      size: [128, 128],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 0,
      max: 1,
      step: 0.0001,
      value: 0,
    });

    this.d0feedback = new NexusUI.Dial("#d0feedback", {
      size: [128, 128],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 0,
      max: 0.9,
      step: 0.0000001,
      value: 0,
    });

    this.d0time = new NexusUI.Dial("#d0time", {
      size: [128, 128],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 256,
      max: 30000,
      step: 1,
      value: 4096,
    });

    this.delay = Delay();
  }

  /**
   * resizePositionQuad
   *
   * @memberof AudioPen
   */
  resizePositionQuad() {
    const padding = 40;
    const navHeight = 32;
    const width = document.body.clientWidth - padding;
    const height = window.innerHeight - navHeight - padding;
    const quadWidth = width / 2;
    const quadHeight = height / 2;

    this.vco1.resize(quadWidth, quadHeight);
    this.vco2.resize(quadWidth, quadHeight);
    this.vco3.resize(quadWidth, quadHeight);
    this.vco4.resize(quadWidth, quadHeight);
  }

  /**
   * initPositionQuad
   *
   * @memberof AudioPen
   */
  initPositionQuad() {
    const padding = 40;
    const navHeight = 32;
    const width = document.body.clientWidth - padding;
    const height = window.innerHeight - navHeight - padding;
    const quadWidth = width / 2;
    const quadHeight = height / 2;

    this.vco1 = new NexusUI.Position("#vco1", {
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

    this.vco2 = new NexusUI.Position("#vco2", {
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

    this.vco3 = new NexusUI.Position("#vco3", {
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

    this.vco4 = new NexusUI.Position("#vco4", {
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
   * @return {*}
   * @memberof AudioPen
   */
  compileCode() {
    const self = this;

    let code = self.aceEditor.getValue();

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
   * @param {*} { outputBuffer }
   * @memberof AudioPen
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
   *
   * @memberof AudioPen
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
