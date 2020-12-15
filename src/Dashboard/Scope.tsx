import * as React from "react";
import { render } from 'react-dom';
import { Oscilloscope } from 'react-nexusui';

export default function Scope() {
  return (
    <>
      <h1>Scope</h1>
      <Oscilloscope></Oscilloscope>
    </>
  );
}
