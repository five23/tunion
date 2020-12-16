import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/webpack-resolver';

import PropTypes from 'prop-types';

const defaultRack = `function process(buffer) {  
  for (var t = 0; t < buffer.length; ++t) {    
    audiopen.processTheta();

    const vco1N = vco1.N * vco1.feedback;
    const vco2N = vco2.N + vco2.feedback;
    const vco3N = vco3.N * vco3.feedback;
    const vco4N = vco4.N * vco4.feedback;

    vco1.out = H.sqr12(vco1.theta, vco1N);
    vco2.out = H.saw12(vco2.theta, vco2N);
    vco3.out = H.saw12(vco3.theta, vco3N);
    vco4.out = H.tri12(vco4.theta, vco4N);
    
    audiopen.processFeedbackMatrix();
    audiopen.processVcoGain();

    out = vco1.gain*vco1.out + 
          vco2.gain*vco2.out + 
          vco3.gain*vco3.out + 
          vco4.gain*vco4.out;
    
    const delayOut = delay
        .gain(d0gain.value)
        .feedback(d0feedback.value)
        .time(d0time.value)
        .run(0.25*out);

    buffer[t] = 0.5*(0.25*out+delayOut);

    audiopen.processDrift();
  }
}`;

/**
 * Editor
 *
 * @export
 * @param {*} props
 * @return {*}
 */
export default function Editor(props) {
  /**
   * onChange
   *
   * @param {*} newValue
   */
  function onChange(newValue) {
    console.log('change', newValue);
  }

  /**
   * onLoad
   */
  function onLoad() {
    console.log('load');
  }

  return (
    <AceEditor
      width={500}
      placeholder="Placeholder Text"
      mode="javascript"
      theme="xcode"
      name="ace-editor"
      onLoad={onLoad}
      onChange={onChange}
      fontSize={14}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={false}
      value={defaultRack}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  );
}

Editor.propTypes = {
  children: PropTypes.node
};
