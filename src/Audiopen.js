import AnalyserView from './js/analyser';

/**
 * Audiopen
 *
 * @class Audiopen
 */
export default class Audiopen {
  constructor(audioCtx) {
    this.audioCtx = audioCtx;
    this.apiFunctionNames = ['process'];
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
   * @memberof Audiopen
   */
  start() {
    const self = this;

    this.initEditor(self);
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

    this.mainLoop();
  }

  /**
   * initEditor
   *
   * @memberof Audiopen
   */
  initEditor(self) {
    ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl);

    this.aceEditor = ace.edit('ace-editor');
    this.aceEditor.setShowPrintMargin(false);
    this.aceEditor.getSession().setMode('ace/mode/javascript');
    this.aceEditor.setValue(defaultRack, -1);
    this.aceEditor.on('change', () => {
      self.codeLastChanged = Date.now();
    });
  }

  /**
   * initVis
   *
   * @memberof Audiopen
   */
  initVis() {
    const self = this;

    const padding = 20;
    const navHeight = 48;
    const screenWidth = document.body.clientWidth - padding * 2;
    const screenHeight = window.innerHeight - navHeight - padding * 3;
    const visWidth = screenWidth / 2;
    const visHeight = screenHeight / 3;

    this.view1crt = document.getElementById('view1crt');

    this.view1crt.width = visWidth;
    this.view1crt.height = visHeight;

    this.analyserView = new AnalyserView(this.view1crt);

    this.view1sel =
      this.view1sel ||
      new NexusUI.Select('#view1sel', {
        size: [visWidth, 28],
        options: ['frequency', 'sonogram', '3d sonogram', 'waveform']
      });

    this.view1sel.on('change', ({ index }) => {
      self.analyserView.setAnalysisType(index);
    });
  }

  /**
   * processDrift
   *
   * @memberof Audiopen
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
   * @memberof Audiopen
   *
  processVcoGain() {
    const self = this;

    this.vco1.gain = H.lpf(self.vco1mat.values[5], self.vco1.gain);
    this.vco2.gain = H.lpf(self.vco2mat.values[5], self.vco2.gain);
    this.vco3.gain = H.lpf(self.vco3mat.values[5], self.vco3.gain);
    this.vco4.gain = H.lpf(self.vco4mat.values[5], self.vco4.gain);
  } */

  /**
   * processTheta
   *
   * @memberof Audiopen
   */
  processTheta() {
    const self = this;

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
   * @memberof Audiopen
   *
  processFeedbackMatrix() {
    const self = this;

    this.vco1.vco1 = self.vco1mat.values[0] * this.vco1.out;
    this.vco1.vco2 = self.vco1mat.values[1] * this.vco2.out;
    this.vco1.vco3 = self.vco1mat.values[2] * this.vco3.out;
    this.vco1.vco4 = self.vco1mat.values[3] * this.vco4.out;

    this.vco1.feedback = 0.25
      * (this.vco1.vco1 + this.vco1.vco2 + this.vco1.vco3 + this.vco1.vco4);

    this.vco2.vco1 = self.vco2mat.values[0] * this.vco1.out;
    this.vco2.vco2 = self.vco2mat.values[1] * this.vco2.out;
    this.vco2.vco3 = self.vco2mat.values[2] * this.vco3.out;
    this.vco2.vco4 = self.vco2mat.values[3] * this.vco4.out;

    this.vco2.feedback = 0.25
      * (this.vco2.vco2 + this.vco2.vco1 + this.vco2.vco3 + this.vco2.vco4);

    this.vco3.vco1 = self.vco3mat.values[0] * this.vco1.out;
    this.vco3.vco2 = self.vco3mat.values[1] * this.vco2.out;
    this.vco3.vco3 = self.vco3mat.values[2] * this.vco3.out;
    this.vco3.vco4 = self.vco3mat.values[3] * this.vco4.out;

    this.vco3.feedback = 0.25
      * (this.vco3.vco1 + this.vco3.vco2 + this.vco3.vco3 + this.vco3.vco4);

    this.vco4.vco1 = self.vco4mat.values[0] * this.vco1.out;
    this.vco4.vco2 = self.vco4mat.values[1] * this.vco2.out;
    this.vco4.vco3 = self.vco4mat.values[2] * this.vco3.out;
    this.vco4.vco4 = self.vco4mat.values[3] * this.vco4.out;

    this.vco4.feedback = 0.25
      * (this.vco4.vco2 + this.vco4.vco1 + this.vco4.vco3 + this.vco4.vco4);
  } */

  /**
   * initDelay
   *
   * @memberof Audiopen
   *
  initDelay() {
    this.d0gain = new NexusUI.Dial('#d0gain', {
      size: [128, 128],
      interaction: 'radial', // "radial", "vertical", or "horizontal"
      mode: 'relative', // "absolute" or "relative"
      min: 0,
      max: 1,
      step: 0.0001,
      value: 0,
    });

    this.d0feedback = new NexusUI.Dial('#d0feedback', {
      size: [128, 128],
      interaction: 'radial', // "radial", "vertical", or "horizontal"
      mode: 'relative', // "absolute" or "relative"
      min: 0,
      max: 0.95,
      step: 0.0000001,
      value: 0,
    });

    this.d0time = new NexusUI.Dial('#d0time', {
      size: [128, 128],
      interaction: 'radial', // "radial", "vertical", or "horizontal"
      mode: 'relative', // "absolute" or "relative"
      min: 32,
      max: 30000,
      step: 1,
      value: 4096,
    });

    this.delay = Delay();
  } */

  /**
   * resizePositionQuad
   *
   * @memberof Audiopen
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
   */

  /**
   * compileCode
   *
   * @return {*}
   * @memberof Audiopen
   */
  compileCode() {
    const self = this;

    let code = self.aceEditor.getValue();

    code += 'return { process };';

    try {
      const pack = code();
      // const pack = new Function(code)();

      self.compiledCode = pack;
      self.codeLastCompiled = Date.now();

      return true;
    } catch (e) {
      // console.log(`Compilation failed: ${e.message}\n${e.stack}`);

      return false;
    }
  }

  /**
   * executeCode
   *
   * @param {*} { outputBuffer }
   * @memberof Audiopen
   */
  executeCode({ outputBuffer }) {
    const self = this;

    let buffer = outputBuffer.getChannelData(0);

    // eslint-disable-next-line no-unused-vars
    buffer = this.compiledCode.process(buffer);

    // this.analyserView.doFrequencyAnalysis(self.analyser);

    const { freqByteData } = this.analyserView;

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

      default:
        self.analyser.smoothingTimeConstant = 0.75;
        self.analyser.getByteFrequencyData(freqByteData);
        break;
    }

    this.analyserView.drawGL();
  }

  /**
   * mainLoop
   *
   * @memberof Audiopen
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
