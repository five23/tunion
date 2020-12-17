import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { JSX } from 'react';
import { Position } from 'react-nexusui';
import { audiopen } from './Tunion.tsx';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2)
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  heroButtons: {
    marginTop: theme.spacing(4)
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '56.25%' // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6)
  }
}));

const cards = [1, 2, 3, 4];

/** 
 * onPositionChange
 *
 * @return {Boolean} false
 */
function onPositionChange(pos) {
  console.log(pos);
}

/**
 * Vcos
 *
 * @export
 * @return {*}  {JSX.Element}
 */
export default function Vcos(): JSX.Element { 
  return (    
      <Grid container spacing={4}>
        {cards.map(
          (card): JSX.Element => (
            <Grid item key={card} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography>VCO</Typography>
                  <Position onChange={onPositionChange} />
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>    
  );
}