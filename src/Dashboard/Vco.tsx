import * as React from 'react';
import { render } from 'react-dom';
import { Position } from 'react-nexusui';
import { useTheme } from '@material-ui/core/styles';

export default function Vco() {
  const theme = useTheme();

  return <Core />;
}

function TitleAndChildren({ children, title }) {
  return (
    <div style={{ margin: 10 }}>
      <h2 className="subtitle">{title}</h2>
      {children}
    </div>
  );
}

function Core() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <TitleAndChildren title="vco1">
            <Position onChange={console.log} />
          </TitleAndChildren>
          <TitleAndChildren title="vco2">
            <Position onChange={console.log} />
          </TitleAndChildren>
          <TitleAndChildren title="vco3">
            <Position onChange={console.log} />
          </TitleAndChildren>
          <TitleAndChildren title="vco4">
            <Position onChange={console.log} />
          </TitleAndChildren>
        </div>
      </div>
    </section>
  );
}
