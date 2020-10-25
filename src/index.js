import 'ace-builds/src-noconflict/ace';
import "ace-builds/src-noconflict/theme-github";
import 'ace-builds/src-noconflict/mode-javascript';

import jsWorkerUrl from "ace-builds/src-noconflict/worker-javascript";

import "./scss/styles.scss";
import "./js/audiopen.js";

import { Delay } from "../node_modules/delay/index";

window.editor = ace.edit('editor');
window.editor.setShowPrintMargin(false);
window.editor.getSession().setMode("ace/mode/javascript");

