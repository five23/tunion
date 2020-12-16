import * as React from 'react';
import ReactDOM, { render } from 'react-dom';
import Audiopen from './Audiopen';
import Dashboard from './Dashboard.tsx';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audiopen = new Audiopen(audioCtx);

window.audiopen = audiopen;

function App(): JSX.Element {
  return (
    <React.Fragment>
      <Dashboard />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
