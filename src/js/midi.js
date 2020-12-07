export function initMidi() {
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
