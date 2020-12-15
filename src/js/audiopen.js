/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ tuni0n
/*----------------------------------*/

//import { kMath } from "./kmath";
import { Harmonic } from "./harmonic";
import { AnalyserView } from "./analyser";
import { Delay } from "./delay";
//import { initMidi } from "./midi";

import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-javascript";
import jsWorkerUrl from "file-loader!ace-builds/src-noconflict/worker-javascript";

import NexusUI from "nexusui";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const H = new Harmonic();

const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {    
    audiopen.processTheta();

    vco1.out = H.sqr12(vco1.theta, vco1.N + vco1.feedback);
    vco2.out = H.saw12(vco2.theta, vco2.N + vco2.feedback);
    vco3.out = H.revsaw12(vco3.theta, vco3.N + vco3.feedback);
    vco4.out = H.tri12(vco4.theta, vco4.N - vco4.feedback);
    
    audiopen.processFeedbackMatrix();
    audiopen.processVcoGain();

    out = 0.25 * (vco1.gain * vco1.out + vco2.gain * vco2.out + vco3.gain * vco3.out + vco4.gain * vco4.out);
    
    const delayOut = delay.gain(d0gain.value).feedback(d0feedback.value).time(d0time.value).run(out);

    buffer[t] = 0.5 * (out + delayOut);

    audiopen.processDrift();
  }
}`;

/**
 * onload
 */
window.onload = () => {
  let audiopen = new AudioPen();

  self.audiopen = audiopen;
  self.out = 0;
  self.H = H;

  self.delay = audiopen.delay;

  self.d0gain = audiopen.d0gain;
  self.d0feedback = audiopen.d0feedback;
  self.d0time = audiopen.d0time;

  let vcoCtrl = {
    step: 0,
    theta: 0,
    N: 0,
    out: 0,
    gain: 1,
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
    this.mixer = document.getElementsByClassName("mixer")[0];

    this.audioCtx = audioCtx;

    this.initDelay();
    this.initFeedback();
    this.initPositionQuad();
    this.initVis();

    //initMidi();

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

    this.initEditor(self);
    this.initToggles(self);
    this.initPatchBankButtons(self);

    this.initPatchBank();    
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
   * initToggles
   *
   * @memberof AudioPen
   */
  initToggles(self) {
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

    this.mixerToggle = new NexusUI.Toggle("#toggle-mixer", {
      size: [40, 20],
      state: false,
    });

    this.mixerToggle.on("change", (v) => {
      if (v) {
        self.mixer.className = "mixer visible";
      } else {
        self.mixer.className = "mixer";
      }
    });

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
   * initEditor
   *
   * @memberof AudioPen
   */
  initEditor(self) {
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
   * initPatchButtons
   *
   * @memberof AudioPen
   */
  initPatchButtons() {
  }


  /**
   * savePatch
   *
   * @memberof AudioPen
   */
  savePatch() {
    let self = this;

    let patchName = document.getElementById("patch-name").value;

    if (!patchName) {
      patchName = `patch_${Date.now()}`;
    }

    this.patchBank.push({
      name: patchName,
      vco1: {
        gain: self.vco1.gain,
        x: self.vco1._x.value,
        y: self.vco1._y.value,
        mat: self.vco1mat.values,
      },
      vco2: {
        gain: self.vco2.gain,
        x: self.vco2._x.value,
        y: self.vco2._y.value,
        mat: self.vco2mat.values,
      },
      vco3: {
        gain: self.vco3.gain,
        x: self.vco3._x.value,
        y: self.vco3._y.value,
        mat: self.vco3mat.values,
      },
      vco4: {
        gain: self.vco4.gain,
        x: self.vco4._x.value,
        y: self.vco4._y.value,
        mat: self.vco4mat.values,
      },
      effects: {
        delay: {
          gain: self.d0gain.value,
          feedback: self.d0feedback.value,
          time: self.d0time.value,
        },
      },
      editor: self.aceEditor.getValue(0),
    });

    if (this.patch) {
      const patchString = JSON.stringify(this.patch);
      const patchBankString = JSON.stringify(this.patchBank);

      console.log("audiopen: Saving patch");
      window.localStorage.setItem("patch", patchString);
      window.localStorage.setItem("patchBank", patchBankString);
    }
  }

  /**
   * loadPatch
   *
   * @memberof AudioPen
   */
  loadPatch(name) {
    this.patchBank.forEach((patch) => {
      if (patch.name == name) {
        this.vco1.x = patch.vco1.x;
        this.vco1.y = patch.vco1.y;

        this.vco2.x = patch.vco2.x;
        this.vco2.y = patch.vco2.y;

        this.vco3.x = patch.vco3.x;
        this.vco3.y = patch.vco3.y;

        this.vco4.x = patch.vco4.x;
        this.vco4.y = patch.vco4.y;

        this.vco1mat.setAllSliders(patch.vco1.mat);
        this.vco2mat.setAllSliders(patch.vco2.mat);
        this.vco3mat.setAllSliders(patch.vco3.mat);
        this.vco4mat.setAllSliders(patch.vco4.mat);

        this.d0gain.value = patch.effects.delay.gain;
        this.d0feedback.value = patch.effects.delay.feedback;
        this.d0time.value = patch.effects.delay.time;

        this.aceEditor.setValue(patch.editor, -1);

        this.compileCode();
      }
    });
  }

  /**
   * initPatch
   *
   * @memberof AudioPen
   */
  initNewPatch() {
    return {
      name: `Default Patch`,
      vco1: {
        gain: this.vco1.gain,
        x: this.vco1._x.value,
        y: this.vco1._y.value,
        mat: this.vco1mat.values,
      },
      vco2: {
        gain: this.vco2.gain,
        x: this.vco2._x.value,
        y: this.vco2._y.value,
        mat: this.vco2mat.values,
      },
      vco3: {
        gain: this.vco3.gain,
        x: this.vco3._x.value,
        y: this.vco3._y.value,
        mat: this.vco3mat.values,
      },
      vco4: {
        gain: this.vco4.gain,
        x: this.vco4._x.value,
        y: this.vco4._y.value,
        mat: this.vco4mat.values,
      },
      effects: {
        delay: {
          gain: this.d0gain.value,
          feedback: this.d0feedback.value,
          time: this.d0time.value,
        },
      },
      editor: this.aceEditor.getValue(0),
    };
  }

  /**
   * initPatchBankButtons
   *
   * @param {*} self
   * @memberof AudioPen
   */
  initPatchBankButtons(self) {
    const savePatch = new NexusUI.TextButton("#save-patch", {
      text: "▼",
      size: [32, 32],
      state: false,
    });

    savePatch.on("click", () => {
      self.savePatch();
    });

    let loadPatch = new NexusUI.TextButton("#load-patch", {
      text: "▲",
      size: [32, 32],
      state: false,
    });

    loadPatch.on("click", () => {
      self.loadPatch(self.patchBankSelect.value);
    });
  }

  /**
   * initPatchBank
   *
   * @memberof AudioPen
   */
  initPatchBank() {
    this.patch = this.initNewPatch();

    const patchBank = JSON.parse(window.localStorage.getItem("patchBank"));

    if (patchBank) {
      this.patchBank = patchBank;

      const patchNames = patchBank.map(({ name }) => name);

      if (patchNames) {
        this.patchBankSelect = new NexusUI.Select("#select-patch", {
          size: [256, 28],
          options: patchNames,
        });
      }
    } else {
      this.patchBank = [this.patch];
    }
  }

  /**
   * initVis
   *
   * @memberof AudioPen
   */
  initVis() {
    let self = this;

    const padding = 20;
    const navHeight = 48;
    const screenWidth = document.body.clientWidth - padding * 2;
    const screenHeight = window.innerHeight - navHeight - padding * 3;
    const visWidth = screenWidth / 2;
    const visHeight = screenHeight / 3;

    this.view1crt = document.getElementById("view1crt");

    this.view1crt.width = visWidth;
    this.view1crt.height = visHeight;

    this.analyserView = new AnalyserView(this.view1crt);

    this.view1sel =
      this.view1sel ||
      new NexusUI.Select("#view1sel", {
        size: [visWidth, 28],
        options: ["frequency", "sonogram", "3d sonogram", "waveform"],
      });

    this.view1sel.on("change", ({ index }) => {
      self.analyserView.setAnalysisType(index);
    });

    this.view1 = new NexusUI.Oscilloscope("#view1", {
      size: [visWidth, visHeight],
    });

    this.spec1 = new NexusUI.Spectrogram("#spec1", {
      size: [visWidth, visHeight],
    });
  }

  /**
   * initFeedback
   *
   * @memberof AudioPen
   */
  initFeedback() {
    this.vco1mat = new NexusUI.Multislider("#vco1mat", {
      size: [256, 256],
      numberOfSliders: 6,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.5],
      smoothing: 0,
      mode: "bar",
    });

    this.vco2mat = new NexusUI.Multislider("#vco2mat", {
      size: [256, 256],
      numberOfSliders: 6,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.5],
      smoothing: 0,
      mode: "bar",
    });

    this.vco3mat = new NexusUI.Multislider("#vco3mat", {
      size: [256, 256],
      numberOfSliders: 6,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.5],
      smoothing: 0,
      mode: "bar",
    });

    this.vco4mat = new NexusUI.Multislider("#vco4mat", {
      size: [256, 256],
      numberOfSliders: 6,
      min: 0,
      max: 1,
      step: 0.0001,
      candycane: 3,
      values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.5],
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
    this.vco1.theta *= 1.0000000112;
    this.vco2.theta *= 0.9999999886;
    this.vco3.theta *= 1.0000000123;
    this.vco4.theta *= 0.9999999875;
  }

  /**
   * processVcoGain
   *
   * @memberof AudioPen
   */
  processVcoGain() {
    let self = this;

    this.vco1.gain = H.lpf(self.vco1mat.values[5], self.vco1.gain);
    this.vco2.gain = H.lpf(self.vco2mat.values[5], self.vco2.gain);
    this.vco3.gain = H.lpf(self.vco3mat.values[5], self.vco3.gain);
    this.vco4.gain = H.lpf(self.vco4mat.values[5], self.vco4.gain);
  }

  /**
   * processTheta
   *
   * @memberof AudioPen
   */
  processTheta() {
    let self = this;

    this.vco1.step = H.lpf(self.vco1._x.value, self.vco1.step);
    this.vco2.step = H.lpf(self.vco2._x.value, self.vco2.step);
    this.vco3.step = H.lpf(self.vco3._x.value, self.vco3.step);
    this.vco4.step = H.lpf(self.vco4._x.value, self.vco4.step);

    this.vco1.N = H.lpf(self.vco1._y.value, self.vco1.N);
    this.vco2.N = H.lpf(self.vco2._y.value, self.vco2.N);
    this.vco3.N = H.lpf(self.vco3._y.value, self.vco3.N);
    this.vco4.N = H.lpf(self.vco4._y.value, self.vco4.N);

    this.vco1.theta += this.vco1.step;
    this.vco2.theta += this.vco2.step;
    this.vco3.theta += this.vco3.step;
    this.vco4.theta += this.vco4.step;
  }

  /**
   * processFeedbackMatrix
   *
   * @memberof AudioPen
   */
  processFeedbackMatrix() {
    let self = this;

    this.vco1.vco1 = self.vco1mat.values[0] * this.vco1.out;
    this.vco1.vco2 = self.vco1mat.values[1] * this.vco2.out;
    this.vco1.vco3 = self.vco1mat.values[2] * this.vco3.out;
    this.vco1.vco4 = self.vco1mat.values[3] * this.vco4.out;

    this.vco1.feedback =
      0.25 *
      (this.vco1.vco1 + this.vco1.vco2 + this.vco1.vco3 + this.vco1.vco4);

    this.vco2.vco1 = self.vco2mat.values[0] * this.vco1.out;
    this.vco2.vco2 = self.vco2mat.values[1] * this.vco2.out;
    this.vco2.vco3 = self.vco2mat.values[2] * this.vco3.out;
    this.vco2.vco4 = self.vco2mat.values[3] * this.vco4.out;

    this.vco2.feedback =
      0.25 *
      (this.vco2.vco2 + this.vco2.vco1 + this.vco2.vco3 + this.vco2.vco4);

    this.vco3.vco1 = self.vco3mat.values[0] * this.vco1.out;
    this.vco3.vco2 = self.vco3mat.values[1] * this.vco2.out;
    this.vco3.vco3 = self.vco3mat.values[2] * this.vco3.out;
    this.vco3.vco4 = self.vco3mat.values[3] * this.vco4.out;

    this.vco3.feedback =
      0.25 *
      (this.vco3.vco1 + this.vco3.vco2 + this.vco3.vco3 + this.vco3.vco4);

    this.vco4.vco1 = self.vco4mat.values[0] * this.vco1.out;
    this.vco4.vco2 = self.vco4mat.values[1] * this.vco2.out;
    this.vco4.vco3 = self.vco4mat.values[2] * this.vco3.out;
    this.vco4.vco4 = self.vco4mat.values[3] * this.vco4.out;

    this.vco4.feedback =
      0.25 *
      (this.vco4.vco2 + this.vco4.vco1 + this.vco4.vco3 + this.vco4.vco4);
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
      max: 0.95,
      step: 0.0000001,
      value: 0,
    });

    this.d0time = new NexusUI.Dial("#d0time", {
      size: [128, 128],
      interaction: "radial", // "radial", "vertical", or "horizontal"
      mode: "relative", // "absolute" or "relative"
      min: 32,
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

    //this.analyserView.doFrequencyAnalysis(self.analyser);

    var freqByteData = this.analyserView.freqByteData;

    switch (this.analyserView.analysisType) {
      case 0:
        self.analyser.smoothingTimeConstant = 0.75;
        self.analyser.getByteFrequencyData(freqByteData);
        break;

      case 1:
      case 2:
        self.analyser.smoothingTimeConstant = 0.1;
        self.analyser.getByteFrequencyData(freqByteData);
        break;

      case 3:
        self.analyser.smoothingTimeConstant = 0.1;
        self.analyser.getByteTimeDomainData(freqByteData);
        break;
    }

    this.analyserView.drawGL();
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
