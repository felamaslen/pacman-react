import React from 'react';
import { render } from 'react-dom';
import Pacman from './Pacman';

const props = {
    gridSize: 12,
    animate: process.env.NODE_ENV !== 'development'
};

render(<Pacman {...props} />, document.getElementById('root'));

