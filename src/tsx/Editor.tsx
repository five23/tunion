import 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-xcode';

import * as React from 'react';
import * as ReactAce from 'react-ace';

import { defaultRack } from './Audiopen.tsx';
import { audiopen } from './Tunion.tsx';

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
    audiopen.codeToCompile = codeToCompile;
    audiopen.codeLastChanged = Date.now();
  }

  /**
   * onLoad
   */
  function onLoad() {
    console.log('load');
  }

  return (
    <ReactAce.default
      width={1000}
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
        tabSize: 2,
        useWorker: false
      }}
    />
  );
}