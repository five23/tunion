"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initMidi = initMidi;

function initMidi() {
  /** @type {*} */
  var midiMessage = document.getElementById("midi");
  /**
   * onMIDIAccess
   *
   * @param {*} midiAccessObject
   */

  var onMIDIAccess = function onMIDIAccess(midiAccessObject) {
    var inputs = midiAccessObject.inputs.values();

    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  };
  /**
   * Convert MIDI note # to frequency in hertz
   *
   * @param {Number} b
   * @param {Number} a
   */


  var MIDItoFreq = function MIDItoFreq(b, a) {
    return 0 === a || 0 < a && 128 > a ? Math.pow(2, (a - 69) / 12) * b : null;
  };
  /**
   * onMIDIMessage
   *
   * @param {*} message
   */


  var onMIDIMessage = function onMIDIMessage(_ref) {
    var data = _ref.data;
    var noteon = false;
    var notemsg = "0, 0";
    var note = data[1];
    var pressure = data[2];
    var frequency = MIDItoFreq(440, note);

    if (pressure) {
      noteon = true;
    }

    if (noteon) {
      notemsg = "1, ".concat(pressure);
    }

    midiMessage.innerHTML = "note: ".concat(note, ", msg: ").concat(notemsg, ", freq: ").concat(frequency);
  };
  /**
   * onMIDIAccessFailure
   *
   * @param {*} err
   */


  var onMIDIAccessFailure = function onMIDIAccessFailure(err) {
    console.log("No MIDI devices are available, or Web MIDI isn\u2019t supported by this browser.");
    console.log("Utilize Chris Wilson\u2019s Web MIDI API Polyfill in order to use the Web MIDI API: http://cwilso.github.io/WebMIDIAPIShim/");
    console.log(err);
  };

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
      sysex: false
    }).then(onMIDIAccess, onMIDIAccessFailure);
  } else {
    console.warn("This browser does not support MIDI.");
  }
}