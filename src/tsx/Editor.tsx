import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/webpack-resolver';

import PropTypes from 'prop-types';

import { defaultRack } from './Audiopen.tsx';

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
   * @param {*}
   */
  function onChange(codeToCompile) {
    window.audiopen.codeToCompile = codeToCompile;
    window.audiopen.codeLastChanged = Date.now();
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
        showLineNumbers: true,
        tabSize: 2
      }}
    />
  );
}

Editor.propTypes = {
  children: PropTypes.node
};
