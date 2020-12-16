import * as React from 'react';
import ReactDOM from 'react-dom';
import Audiopen from './Audiopen';
import Dashboard from './Dashboard.tsx';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audiopen = new Audiopen(audioCtx);

window.audiopen = audiopen;

/**
 * App
 *
 * @return {*}  {JSX.Element}
 */
function App(): JSX.Element {
  return <Dashboard />;
}

ReactDOM.render(<App />, document.getElementById('root'));
