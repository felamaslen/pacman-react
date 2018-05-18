import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from '../constants';
import { cssPosition } from '../helpers';
import './style.scss';

function MonsterEye({ gridSize, offset, direction }) {
    return null;
}

MonsterEye.propTypes = {
    offset: PropTypes.number.isRequired,
    gridSize: PropTypes.number.isRequired,
    direction: PropTypes.number.isRequired
};

function getMonsterPath(radius) {
    const width = radius * 2;
    const height = radius * 2;
    const radiusSmall = radius / 5;

    return [
        `M${radius},0`,
        `A${radius},${radius} 0 0 1 ${width},${radius}`,
        `L${width},${height - radiusSmall}`,
        `A${radiusSmall},${radiusSmall} 0 0 1 ${width - radiusSmall * 2},${height - radiusSmall}`,
        `A${radiusSmall},${radiusSmall} 0 0 0 ${width - radiusSmall * 4},${height - radiusSmall}`,
        `A${radiusSmall},${radiusSmall} 0 0 1 ${width - radiusSmall * 6},${height - radiusSmall}`,
        `A${radiusSmall},${radiusSmall} 0 0 0 ${width - radiusSmall * 8},${height - radiusSmall}`,
        `A${radiusSmall},${radiusSmall} 0 0 1 ${width - radiusSmall * 10},${height - radiusSmall}`,
        `L0,${height - radiusSmall}`,
        `L0,${radius}`,
        `A${radius},${radius} 0 0 1 ${radius},0`
    ]
        .join(' ');
}

function MonsterIcon(props) {
    const { position, gridSize, color } = props;

    const radius = gridSize * 0.75;
    const monsterPath = getMonsterPath(radius);
    const pathProps = {
        stroke: 'none',
        fill: color
    };

    const style = {
        ...cssPosition(position, gridSize),
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius
    };

    return (
        <svg className="pacman-monster" style={style}>
            <path d={monsterPath} {...pathProps} />
            <MonsterEye {...props} offset={-1} />
            <MonsterEye {...props} offset={1} />
        </svg>
    );
}

MonsterIcon.propTypes = {
    gridSize: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    color: PropTypes.string.isRequired,
    live: PropTypes.bool.isRequired,
    direction: PropTypes.number.isRequired
};

export default class Monster extends Component {
    constructor(props) {
        super(props);

        this.state = {
            direction: DIRECTION_EAST
        };
    }
    static propTypes = {
        gridSize: PropTypes.number.isRequired,
        position: PropTypes.array.isRequired,
        color: PropTypes.string.isRequired,
        live: PropTypes.bool.isRequired
    };
    render() {
        return (
            <MonsterIcon {...this.props} {...this.state} />
        );
    }
}

