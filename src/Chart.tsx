import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import Title from './Title.tsx';

export default function Chart() {
  const theme = useTheme();

  return (
    <>
      <Title>Today</Title>
    </>
  );
}
