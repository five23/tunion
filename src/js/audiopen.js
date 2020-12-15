/* ----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ tuni0n
/*----------------------------------*/

// import { kMath } from "./kmath";
import ace from 'ace-builds/src-noconflict/ace';
import { Harmonic } from './harmonic';
import { AnalyserView } from './analyser';
import { Delay } from './delay';
// import { initMidi } from "./midi";

import 'ace-builds/src-noconflict/mode-javascript';
import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript';

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
  const audiopen = new Audiopen();

  self.audiopen = audiopen;
  self.out = 0;
  self.H = H;

  self.delay = audiopen.delay;

  self.d0gain = audiopen.d0gain;
  self.d0feedback = audiopen.d0feedback;
  self.d0time = audiopen.d0time;

  const vcoCtrl = {
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

  self.addEventListener('resize', () => audiopen.resizePositionQuad(), true);
};