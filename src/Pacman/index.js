import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getInitialState from './state';
import Board from './Board';
import AllFood from './AllFood';
import Monster from './Monster';
import Player from './Player';
import './style.scss';

export default class Pacman extends Component {
    constructor(props) {
        super(props);

        this.state = getInitialState();
    }
    render() {
        const monsters = this.state.monsters.map(({ id, ...monster }) => (
            <Monster key={id} {...this.props} eating={this.state.eating} {...monster} />
        ));

        return (
            <div className="pacman">
                <Board {...this.props} />
                <AllFood {...this.props} food={this.state.food} />
                {monsters}
                <Player {...this.props} {...this.state.player} />
            </div>
        );
    }
}

Pacman.propTypes = {
    gridSize: PropTypes.number.isRequired
};

