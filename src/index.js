import React from 'react';
import { render } from 'react-dom';
import Pacman from './Pacman';

const props = {
    gridSize: 12,
    animate: process.env.NODE_ENV !== 'development'
};

function renderApp(PacmanApp = Pacman) {
    render(<PacmanApp {...props} />, document.getElementById('root'));
}

renderApp();

if (module.hot) {
    // eslint-disable-next-line global-require
    module.hot.accept('./Pacman', () => renderApp(require('./Pacman').default));
}

