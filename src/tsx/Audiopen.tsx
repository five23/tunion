import { AnalyserView } from '../js/analyser';
import { H } from './Tunion.tsx';

export const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {    
    audiopen.processTheta();

    audiopen.vco1.out = H.sqr12(audiopen.vco1.theta, 4);

    //vco2.out = H.saw12(vco2.theta, vco2.N + vco2.feedback);
    //vco3.out = H.revsaw12(vco3.theta, vco3.N + vco3.feedback);
    //vco4.out = H.tri12(vco4.theta, vco4.N - vco4.feedback);
    
    //audiopen.processFeedbackMatrix();
    //audiopen.processVcoGain();
    //out = 0.25 * (vco1.gain * vco1.out + vco2.gain * vco2.out + vco3.gain * vco3.out + vco4.gain * vco4.out);    
    //const delayOut = delay.gain(d0gain.value).feedback(d0feedback.value).time(d0time.value).run(out);
    //buffer[t] = 0.5 * (out + delayOut);
    //audiopen.processDrift();

    audiopen.out = 0.25 * audiopen.vco1.out;
    
    buffer[t] = audiopen.out;
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
      gain: 0.25,
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

    this.vco1.step = H.lpf(800, this.vco1.step);
    this.vco1.N = H.lpf(4, this.vco1.N);
    this.vco1.theta += this.vco1.step;
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
