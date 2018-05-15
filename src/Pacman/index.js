import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getInitialState from './state';
import Board from './Board';

import './style.scss';

export default class Pacman extends Component {
    constructor(props) {
        super(props);

        this.state = getInitialState();
    }
    render() {
        return (
            <div className="pacman">
                <Board {...this.props} />
            </div>
        );
    }
}

Pacman.propTypes = {
    gridSize: PropTypes.number.isRequired
};

