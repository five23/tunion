import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './Dashboard/Dashboard.tsx';
import Audiopen from "./Audiopen";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.Audiopen = new Audiopen(audioCtx);

ReactDOM.render(<Dashboard />, document.querySelector('#root'));
