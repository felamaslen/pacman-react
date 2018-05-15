import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { BOARD_HEIGHT } from '../constants';
import './style.scss';

export default function Food({ gridSize, position, eaten, big }) {
    const className = classNames('food', { eaten, big });

    const style = {
        left: (position[0] + 1.5) * gridSize,
        top: (BOARD_HEIGHT - position[1] - 3.5) * gridSize
    };

    return (
        <span className={className} style={style} />
    );
}

Food.propTypes = {
    gridSize: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    eaten: PropTypes.bool.isRequired,
    big: PropTypes.bool.isRequired
};

