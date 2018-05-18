import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cssPosition } from '../helpers';
import './style.scss';

function MonsterEye({ radius, offset, direction }) {
    const eyeballCenterX = radius * (1 + 0.4 * offset);
    const eyeballCenterY = radius * 0.7;
    const eyeballRadius = radius * 0.3;

    const reverse = (-1) ** ((direction < 2) >> 0);
    const vertical = direction % 2;
    const horizontal = 1 - vertical;

    const irisOffsetX = -horizontal * reverse;
    const irisOffsetY = vertical * reverse;

    const outerProps = {
        cx: eyeballCenterX,
        cy: eyeballCenterY,
        'r': eyeballRadius,
        fill: 'white'
    };

    const irisProps = {
        cx: eyeballCenterX + eyeballRadius / 2 * irisOffsetX,
        cy: eyeballCenterY + eyeballRadius / 2 * irisOffsetY,
        'r': eyeballRadius / 2,
        fill: 'black'
    };

    return (
        <g className="eye">
            <circle {...outerProps} />
            <circle {...irisProps} />
        </g>
    );
}

MonsterEye.propTypes = {
    radius: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
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
            <MonsterEye radius={radius} {...props} offset={-1} />
            <MonsterEye radius={radius} {...props} offset={1} />
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
            direction: props.direction
        };
    }
    static propTypes = {
        gridSize: PropTypes.number.isRequired,
        position: PropTypes.array.isRequired,
        direction: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
        live: PropTypes.bool.isRequired
    };
    render() {
        return (
            <MonsterIcon {...this.props} {...this.state} />
        );
    }
}

