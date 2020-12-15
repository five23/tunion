//@ts-ignore
import Nexus from "nexusui";
import * as React from "react";
import { render } from "react-dom";
import { Position } from "react-nexusui";

function TitleAndChildren({ children, title }) {
  return (
    <div style={{ margin: 10 }}>
      <h2 className={"subtitle"}>{title}</h2>
      {children}
    </div>
  );
}

function Core() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "flex", flexWrap: "wrap" }}>          
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

function App() {
  return (
    <React.Fragment>
      <Core />      
    </React.Fragment>
  );
}

render(<App />, document.getElementById("app"));
