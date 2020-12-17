import { AnalyserView } from '../js/analyser';
import { H } from './Tunion.tsx';

export const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {    
    audiopen.processTheta();
    audiopen.processVcoGain();    

    audiopen.vco1.out = H.sqr12(audiopen.vco1.theta, audiopen.vco1.N);
    audiopen.vco2.out = H.sqr12(audiopen.vco2.theta, audiopen.vco2.N);
    audiopen.vco3.out = H.sqr12(audiopen.vco3.theta, audiopen.vco3.N);
    audiopen.vco4.out = H.sqr12(audiopen.vco4.theta, audiopen.vco4.N);

    audiopen.out = audiopen.vco1.A * audiopen.vco1.out + 
                   audiopen.vco2.A * audiopen.vco2.out + 
                   audiopen.vco3.A * audiopen.vco3.out + 
                   audiopen.vco4.A * audiopen.vco4.out;
    
    buffer[t] = 0.25 * audiopen.out;
  }

  return buffer;
}`;

/**
 * VCO
 *
 * @export
 * @interface VCO
 */
export interface VCO {
  step?: number;
  theta?: number;
  N?: number;
  out?: number;
  gain?: number;
  A?: number;
  vco1feed?: number;
  vco2feed?: number;
  vco3feed?: number;
  vco4feed?: number;
  feedback?: number;
  frequency?: number;
  harmonics?: number;
}

/**
 * Audiopen
 *
 * @export
 * @class Audiopen
 */
export default class Audiopen {
  audioCtx: any;
  isPlaying: boolean;
  compiledCode: any;
  codeToCompile: any;
  codeLastChanged: number;
  codeLastCompiled: number;
  compilationDelay: number;
  sampleRate: number;
  bufferSize: number;
  t: number;
  channelCount: number;
  gainNode: any;
  scriptNode: any;
  analyser: any;
  aceEditor: any;
  glCanvas: HTMLElement;
  analyserView: any;
  view1sel: any;
  out: number;
  vco1: VCO;
  vco2: VCO;
  vco3: VCO;
  vco4: VCO;
  amplitudeData: Uint8Array;
  globalPadding: number;
  globalNavHeight: number;
  screenWidth: number;
  screenHeight: number;
  view1width: number;
  view1height: number;

  /**
   * Creates an instance of Audiopen.
   * @param {*} audioCtx
   * @memberof Audiopen
   */
  constructor(audioCtx) {
    let self = this;

    this.audioCtx = audioCtx;
    this.isPlaying = false;
    this.codeToCompile = defaultRack;
    this.compiledCode = null;
    this.codeLastChanged = 0;
    this.codeLastCompiled = 0;
    this.compilationDelay = 1e3;
    this.sampleRate = 44100;
    this.bufferSize = 2048;
    this.t = 0;
    this.out = 0;
    this.channelCount = 2;

    this.vco1 = {
      step: 0,
      theta: 0,
      N: 0,
      out: 0,
      gain: 0,
      A: 0,
      vco1feed: 0,
      vco2feed: 0,
      vco3feed: 0,
      vco4feed: 0,
      feedback: 0,
      frequency: 0,
      harmonics: 0
    };

    this.vco2 = {
      step: 0,
      theta: 0,
      N: 0,
      out: 0,
      gain: 0,
      A: 0,
      vco1feed: 0,
      vco2feed: 0,
      vco3feed: 0,
      vco4feed: 0,
      feedback: 0,
      frequency: 0,
      harmonics: 0
    };

    this.vco3 = {
      step: 0,
      theta: 0,
      N: 0,
      out: 0,
      gain: 0,
      A: 0,
      vco1feed: 0,
      vco2feed: 0,
      vco3feed: 0,
      vco4feed: 0,
      feedback: 0,
      frequency: 0,
      harmonics: 0
    };

    this.vco4 = {
      step: 0,
      theta: 0,
      N: 0,
      out: 0,
      gain: 0,
      A: 0,
      vco1feed: 0,
      vco2feed: 0,
      vco3feed: 0,
      vco4feed: 0,
      feedback: 0,
      frequency: 0,
      harmonics: 0
    };

    this.globalPadding = 20;
    this.globalNavHeight = 48;
    this.screenWidth = document.body.clientWidth - this.globalPadding * 2;
    this.screenHeight =
      window.innerHeight - this.globalNavHeight - this.globalPadding * 3;

    this.glCanvas = document.getElementById('glCanvas');

    this.view1width = this.screenWidth / 2;
    this.view1height = this.screenHeight / 2;

    this.analyserView = new AnalyserView(this.glCanvas);
    this.analyserView.setAnalysisType(0);

    this.gainNode = this.audioCtx.createGain();
    this.scriptNode = this.audioCtx.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );

    this.compileCode();

    this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    this.analyser = this.audioCtx.createAnalyser();
    this.scriptNode.connect(self.analyser);
    this.scriptNode.connect(self.audioCtx.destination);
    this.analyserView.initByteBuffer(self.analyser);
    this.amplitudeData = new Uint8Array(self.analyser.frequencyBinCount);

    this.mainLoop();
  }

  /**
   * processTheta
   *
   * @memberof AudioPen
   */
  processTheta() {
    let self = this;

    this.vco1.step = H.lpf(this.vco1.frequency, this.vco1.step);
    this.vco2.step = H.lpf(this.vco2.frequency, this.vco2.step);
    this.vco3.step = H.lpf(this.vco3.frequency, this.vco3.step);
    this.vco4.step = H.lpf(this.vco4.frequency, this.vco4.step);

    this.vco1.N = H.lpf(this.vco1.harmonics, this.vco1.N);
    this.vco2.N = H.lpf(this.vco2.harmonics, this.vco2.N);
    this.vco3.N = H.lpf(this.vco3.harmonics, this.vco3.N);
    this.vco4.N = H.lpf(this.vco4.harmonics, this.vco4.N);

    this.vco1.theta += this.vco1.step;
    this.vco2.theta += this.vco2.step;
    this.vco3.theta += this.vco3.step;
    this.vco4.theta += this.vco4.step;
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

    this.vco1.A = H.lpf(this.vco1.gain, this.vco1.A);
    this.vco2.A = H.lpf(this.vco2.gain, this.vco2.A);
    this.vco3.A = H.lpf(this.vco3.gain, this.vco3.A);
    this.vco4.A = H.lpf(this.vco4.gain, this.vco4.A);
  }


  /**
   * compileCode
   *
   * @return {*}
   * @memberof Audiopen
   */
  compileCode() {
    let code = this.codeToCompile;

    code += `return { process };`;

    try {
      const pack = new Function(code)();

      this.compiledCode = pack;
      this.codeLastCompiled = Date.now();

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
   * @memberof Audiopen
   */
  executeCode({ outputBuffer }) {
    const self = this;

    let buffer = outputBuffer.getChannelData(0);

    buffer = this.compiledCode.process(buffer);

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
