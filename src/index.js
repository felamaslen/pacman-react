import React from 'react';
import { render } from 'react-dom';

import './main.scss';

function App() {
    return (
        <div>
            <span>{'React works'}</span>
        </div>
    );
}

render(<App />, document.getElementById('root'));

