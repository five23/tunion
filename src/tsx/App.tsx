import * as React from 'react';
import ReactDOM from 'react-dom';
import Tunion from './Tunion.tsx';

function App(): JSX.Element {
  return (
    <React.Fragment>
      <Tunion />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
