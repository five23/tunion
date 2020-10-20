var audiopen = null,
  analyser;

var a0 = 0,
  a1 = 0,
  b0 = 0,
  b1 = 0,
  c0 = 0,
  c1 = 0,
  d0 = 0,
  d1 = 0,
  aN = 0,
  aT = 0,
  bN = 0,
  bT = 0,
  cN = 0,
  cT = 0,
  dN = 0,
  dT = 0,
  aX = 0,
  bX = 0,
  cX = 0,
  dX = 0,
  aZ = 0,
  bZ = 0,
  cZ = 0,
  dZ = 0,
  aY = 0,
  bY = 0,
  cY = 0,
  dY = 0;

var inL, outL, out;

o3djs.require("o3djs.shader");

// Temporary patch until all browsers support unprefixed context.
if (
  window.hasOwnProperty("AudioContext") &&
  !window.hasOwnProperty("webkitAudioContext")
)
  window.webkitAudioContext = AudioContext;

window.requestAnimationFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

nx.onload = () => {
  nx.sendsTo("js");

  o1a.set({
    value: 0,
  });
  o1a.init();
  o2a.set({
    value: 0,
  });
  o2a.init();
  o3a.set({
    value: 0,
  });
  o3a.init();

  o1b.set({
    value: 0,
  });
  o1b.init();
  o2b.set({
    value: 0,
  });
  o2b.init();
  o3b.set({
    value: 0,
  });
  o3b.init();
  o1c.set({
    value: 0,
  });
  o1c.init();
  o2c.set({
    value: 0,
  });
  o2c.init();
  o3c.set({
    value: 0,
  });
  o3c.init();

  o1d.set({
    value: 0.5,
  });
  o1d.init();
  o2d.set({
    value: 0.5,
  });
  o2d.init();
  o3d.set({
    value: 0.5,
  });
  o3d.init();

  o1e.set({
    value: 0.25,
  });
  o1e.init();
  o2e.set({
    value: 0.25,
  });
  o2e.init();
  o3e.set({
    value: 0.25,
  });
  o3e.init();
  vca.val.x = 0;
  vca.val.y = 0;
  vca.init();

  vcb.val.x = 0;
  vcb.val.y = 0;
  vcb.init();

  vcc.val.x = 0;
  vcc.val.y = 0;
  vcc.init();

  delayInput.set({ value: 0 });
  delayInput.init();
  delayInput.n = 0;

  delayTime.set({ value: 0 });
  delayTime.init();
  delayTime.n = 0;

  delayFeedback.set({ value: 0 });
  delayFeedback.init();
  delayFeedback.n = 0;

  delayGain.set({ value: 0.5 });
  delayGain.init();
  delayGain.n = 0;

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

class AudioPen {
  constructor() {
    this.apiFunctionNames = ["process"];
    this.isPlaying = false;
    this.compiledCode = null;
    this.lastCodeChangeTime = 0;
    this.lastCompilationTime = 0;
    this.compilationDelay = 1e3;
    this.sampleRate = 44100;
    this.bufferSize = 2048;
    this.t = 0;

    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    this.analyserView = new AnalyserView("view1");

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.on("change", (e) => {
      self.lastCodeChangeTime = Date.now();
    });
  }

  start(stream) {
    var self = this;

    this.compileCode();

    this.streamNode = this.audioContext.createMediaStreamSource(stream);

    this.jsProcessor = this.audioContext.createScriptProcessor(
      this.bufferSize,
      1,
      1
    );
    this.jsProcessor.onaudioprocess = (audioProcessingEvent) => {
      self.executeCode(audioProcessingEvent);
    };

    analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.3;

    this.jsProcessor.connect(analyser);

    analyser.connect(this.audioContext.destination);
    analyser.getByteFrequencyData(new Uint8Array(analyser.frequencyBinCount));

    this.analyser = analyser;

    this.analyserView.initByteBuffer();

    this.mainLoop();
  }

  compileCode() {
    let code = this.editor.getValue();
    var memberDefs = [];

    var fname = "process";
    memberDefs.push(`${fname}:(typeof ${fname}=='function'?${fname}:null)`);

    var callback = `\nreturn {${memberDefs.join(",")} };`;

    code += callback;

    this.lastCompilationTime = Date.now();

    let pack = null;
    try {
      pack = new Function(code)();
    } catch (ex) {
      console.log(`Compilation failed: ${ex.message}\n${ex.stack}`);
      return false;
    }
    this.compiledCode = pack;
    return true;
  }

  executeCode(buffer) {
    buffer = this.compiledCode.process(buffer);
  }

  mainLoop() {
    var self = this;

    window.requestAnimationFrame(() => {
      self.mainLoop();
      self.analyserView.doFrequencyAnalysis();
    });

    if (
      Date.now() - this.lastCodeChangeTime > this.compilationDelay &&
      this.lastCodeChangeTime > this.lastCompilationTime
    ) {
      this.compileCode();
    }
    if (this.compiledCode.onGui) {
      this.compiledCode.onGui();
    }
  }
}

function AudioPenAPI(a) {
  var core = a;
  this.sampleRate = () => {
    return core.sampleRate;
  };
}
