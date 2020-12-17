import PropTypes from 'prop-types';
import React from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/webpack-resolver';

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
		<AceEditor
			width='500'
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
