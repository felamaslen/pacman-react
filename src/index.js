import React from 'react';
import { render } from 'react-dom';
import Pacman from './Pacman';

const props = {
    gridSize: 12
};

render(<Pacman {...props} />, document.getElementById('root'));

