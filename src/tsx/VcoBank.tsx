import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { Multislider, Position, Dial } from 'react-nexusui';
import { audiopen } from './Tunion.tsx';

const vcoIds = [1, 2, 3, 4];

/**
 * onPositionChange
 *
 * @param {*} attr
 */
function onPositionChange(attr) {
  console.log(attr);

  let vco = getVcoById(attr.id);

  vco.frequency = attr.x;
  vco.harmonics = attr.y;
}

/**
 * onMultisliderChange
 *
 * @param {*} attr
 */
function onMultisliderChange(attr) {
  console.log(attr);

  let vco = getVcoById(attr.id);

  vco.vco1feed = attr[0];
  vco.vco2feed = attr[1];
  vco.vco3feed = attr[2];
  vco.vco4feed = attr[3];
}

/**
 * onDialChange
 *
 * @param {*} attr
 */
function onDialChange(attr) {
  console.log(attr);
  
  let vco = getVcoById(attr.id);

  vco.gain = attr.value;
}

/**
 * getVcoById
 *
 * @export
 * @param {Number} id
 * @return {Mixed}
 */
const getVcoById = (id) => Function(`return audiopen.vco${id};`)();

/**
 * VcoBank
 *
 * @export
 * @return {*}  {JSX.Element}
 */
export default function VcoBank(): JSX.Element {
  return (
    <Grid container spacing={1}>
      {vcoIds.map((id) => (
        <Grid item key={id} xs={12} sm={6} md={4}>
          <Card>
            <Typography>vco{id}</Typography>
            <CardContent>
              <Grid container spacing={0}>
                <Grid item>
                  <Position
                    onChange={(e: any) =>
                      onPositionChange({
                        x: e.x,
                        y: e.y,
                        id: id
                      })
                    }
                  />
                </Grid>
                <Grid item>
                  <Multislider
                    numberOfSliders={5}
                    min={0}
                    max={1}
                    step={0.00025}
                    candycane={3}
                    values={[0.0, 0.0, 0.0, 0.0, 0.1]}
                    smoothing={0}
                    mode={'bar'}
                    onChange={(e) =>
                      onMultisliderChange(Object.assign(e, { id: id }))
                    }
                  />
                </Grid>
                <Grid item>
                  <Dial
                    min={0}
                    max={1}
                    step={0.00025}
                    value={0.5}
                    onChange={(e) => onDialChange({ value: e, id: id })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
