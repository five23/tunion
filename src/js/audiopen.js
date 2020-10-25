/*----------------------------------//
      _ __/`\/
    /'( _ (^'
    /'| `>\ uni0nsongbook
/*----------------------------------*/

import "./visualizer";

var audiopen = null,
  analyser;

window.onload = init;

/*
const hasClass = (el, name) => {
  el.matches(`.${name}`) ? 1 : 0;
};

const addClass = (el, className) => {
  if (el.classList) {
    el.classList.add(className);
  } else if (!hasClass(el, className)) {
    el.className += ` ${className}`;
  }
};

const removeClass = (el, className) => {
  if (el.classList) el.classList.remove(className);
  else if (hasClass(el, className)) {
    const reg = new RegExp(`(\\s|^)${className}(\\s|$)`);
    el.className = el.className.replace(reg, " ");
  }
};*/

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
  dZ = 0;

var inL, outL, out;

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

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else if (!el.matches("." + className)) {
    el.className += " " + className;
  }
}

function removeClass(el, className) {
  if (el.classList) el.classList.remove(className);
  else if (!el.matches("." + className)) {
    var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
    el.className = el.className.replace(reg, " ");
  }
}

window.onload = () => {
  var editor = document.getElementById("editor");
  var editorToggle = Nexus.Add.Toggle("#header-panel");

  editorToggle.on("change", function (v) {
    if (!editor.matches(".visible")) {
      removeClass(editor, "visible");
    } else {
      addClass(editor, "visible");
    }
  });

  var vizSelect = Nexus.Add.RadioButton("#header-panel", {
    size: [120, 25],
    numberOfButtons: 4,
    active: -1,
  });
  /*
  nx.sendsTo("js");


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
*/

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

function AudioPen() {
  this.apiFunctionNames = ["process"];
  this.isPlaying = false;
  this.compiledCode = null;
  this.lastCodeChangeTime = 0;
  this.lastCompilationTime = 0;
  this.compilationDelay = 1e3;
  this.sampleRate = 44100;
  this.bufferSize = 2048;
  this.t = 0;
}

AudioPen.prototype = {
  start: function (stream) {
    var self = this;

    this.audioContext = new AudioContext();
    this.analyserView = new AnalyserView("view1");

    this.editor = ace.edit("editor");
    this.editor.setShowPrintMargin(false);
    this.editor.getSession().setMode("ace/mode/javascript");
    this.editor.on("change", () => {
      self.lastCodeChangeTime = Date.now();
    });

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
  },

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

  executeCode: function (buffer) {
    if (buffer === null) return;
    buffer = this.compiledCode.process(buffer);
  },

  mainLoop: function () {
    var self = this;

    requestAnimationFrame(function () {
      self.mainLoop();
    });

    if (
      Date.now() - this.lastCodeChangeTime > this.compilationDelay &&
      this.lastCodeChangeTime > this.lastCompilationTime
    ) {
      this.compileCode();
    } else if (this.compiledCode.onGui) {
      this.compiledCode.onGui();
    }

    this.analyserView.doFrequencyAnalysis(this.analyser);
    //this.renderWave();
  },
};
