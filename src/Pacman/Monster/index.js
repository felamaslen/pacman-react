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

function WaveMouth({ gridSize, eating }) {
    if (!eating) {
        return null;
    }

    const waveRadius = gridSize * 0.125;
    const yPos = gridSize * 0.95;

    const mouthPath = [
        `M${waveRadius * 2},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 1 ${3 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 0 ${4 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 1 ${5 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 0 ${6 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 1 ${7 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 0 ${8 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 1 ${9 * waveRadius},${yPos}`,
        `A${waveRadius},${waveRadius * 5} 0 0 0 ${10 * waveRadius},${yPos}`
    ]
        .join(' ');

    return (
        <path d={mouthPath} stroke="white" strokeWidth={1} />
    );
}

WaveMouth.propTypes = {
    gridSize: PropTypes.number.isRequired,
    eating: PropTypes.bool.isRequired
};

function getColor(eating, eatingFlash, color) {
    if (eating) {
        if (eatingFlash) {
            return '#c9a';
        }

        return '#06c';
    }

    return color;
}

function MonsterIcon({ gridSize, eating, eatingFlash, position, direction, color }) {
    const radius = gridSize * 0.75;
    const monsterPath = getMonsterPath(radius);
    const pathProps = {
        stroke: 'none',
        fill: getColor(eating, eatingFlash, color)
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
            <WaveMouth gridSize={gridSize} eating={eating} />
            <MonsterEye radius={radius} direction={direction} offset={-1} />
            <MonsterEye radius={radius} direction={direction} offset={1} />
        </svg>
    );
}

MonsterIcon.propTypes = {
    eating: PropTypes.bool.isRequired,
    eatingFlash: PropTypes.number,
    gridSize: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    color: PropTypes.string.isRequired,
    direction: PropTypes.number.isRequired
};

export default class Monster extends Component {
    constructor(props) {
        super(props);

        this.state = {
            eatingFlash: 0,
            timerFlash: this.getTimerFlash()
        };
    }
    getTimerFlash() {
        if (this.state) {
            clearInterval(this.state.timerFlash);
        }

        if (!this.props.eatingTime) {
            return null;
        }

        return setInterval(() => {
            this.setState({ eatingFlash: (this.state.eatingFlash + 1) % 2 });
        }, 500);
    }
    componentDidUpdate(prevProps) {
        if ((this.props.eatingTime > 0 && prevProps.eatingTime === 0) ||
            (this.props.eatingTime === 0 && prevProps.eatingTime > 0)) {

            this.setState({ timerFlash: this.getTimerFlash() });
        }
    }
    componentWillUnmount() {
        clearInterval(this.state.timerFlash);
    }
    static propTypes = {
        gridSize: PropTypes.number.isRequired,
        position: PropTypes.array.isRequired,
        direction: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
        eatingTime: PropTypes.number.isRequired,
        deadTime: PropTypes.number.isRequired
    };
    render() {
        if (this.props.deadTime > 0) {
            return null;
        }

        const { eatingTime, ...props } = this.props;
        const eating = eatingTime > 0;

        return (
            <MonsterIcon eating={eating} {...props} {...this.state} />
        );
    }
}

