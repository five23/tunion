import * as React from 'react';
import ReactDOM, { render } from 'react-dom';
import Audiopen from './Audiopen';
import Tunion from './Tunion.tsx';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audiopen = new Audiopen(audioCtx);

window.audiopen = audiopen;

function App(): JSX.Element {
  return (
    <React.Fragment>
      <Tunion />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
