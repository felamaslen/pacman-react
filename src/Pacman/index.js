import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from './constants';
import getInitialState from './state';
import { animate, changeDirection } from './game';
import Board from './Board';
import AllFood from './AllFood';
import Monster from './Monster';
import Player from './Player';
import './style.scss';

export default class Pacman extends Component {
    constructor(props) {
        super(props);

        this.state = getInitialState();

        this.onKey = evt => {
            if (evt.code === 'Space') {
                return this.step();
            }
            if (evt.key === 'ArrowRight') {
                return this.changeDirection(DIRECTION_EAST);
            }
            if (evt.key === 'ArrowUp') {
                return this.changeDirection(DIRECTION_NORTH);
            }
            if (evt.key === 'ArrowLeft') {
                return this.changeDirection(DIRECTION_WEST);
            }
            if (evt.key === 'ArrowDown') {
                return this.changeDirection(DIRECTION_SOUTH);
            }

            return null;
        };
    }
    componentDidMount() {
        window.addEventListener('keydown', this.onKey);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKey);
    }
    step() {
        this.setState(animate(this.state, { time: this.state.stepTime + 100 }));
    }
    changeDirection(direction) {
        this.setState(changeDirection(this.state, { direction }));
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

