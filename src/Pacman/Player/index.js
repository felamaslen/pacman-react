import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PLAYER_RADIUS } from '../constants';
import { cssPosition } from '../helpers';
import './style.scss';

const ANIMATION_SPEED = 30;

function pacmanPath(radius, angle, offset) {
    if (!angle) {
        return [
            `M0,${radius}`,
            `A${radius},${radius} 0 1 0 ${radius * 2},${radius}`,
            `A${radius},${radius} 0 1 0 0,${radius}`
        ]
            .join(' ');
    }

    const offsetX = radius * Math.cos(angle / 2);
    const offsetY = radius * Math.sin(angle / 2);

    const polarity = (-1) ** Math.floor(offset / 2);

    const m00 = ((offset + 1) % 2) * polarity;
    const m01 = (offset % 2) * polarity;

    const biteX1 = offsetX * m00 - offsetY * m01;
    const biteY1 = -offsetX * m01 - offsetY * m00;
    const biteX2 = offsetX * m00 + offsetY * m01;
    const biteY2 = -offsetX * m01 + offsetY * m00;

    const arcFlag = (angle < Math.PI) >> 0;

    return [
        `M${radius},${radius}`,
        `L${radius + biteX1},${radius + biteY1}`,
        `A${radius},${radius}`,
        `0 ${arcFlag} 0`,
        `${radius + biteX2},${radius + biteY2}`,
        `L${radius},${radius}`
    ]
        .join(' ');
}

export default class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            angle: 1,
            timerBite: null,
            timerLose: null
        };

        this.startTime = Date.now();
    }
    componentDidMount() {
        this.setState({
            timerBite: setInterval(() => this.setState({
                angle: 1 + 0.5 * Math.sin((Date.now() - this.startTime) / 50)
            }), ANIMATION_SPEED)
        });
    }
    componentWillUnmount() {
        clearInterval(this.state.timerBite);
        clearTimeout(this.state.timerLose);
    }
    onLoseAnimation() {
        if (this.state.angle < Math.PI * 2) {
            return setTimeout(() => {
                this.setState({
                    angle: Math.min(Math.PI * 2, this.state.angle + 0.1),
                    timerLose: this.onLoseAnimation()
                });
            }, ANIMATION_SPEED);
        }

        if (this.props.onEnd) {
            setImmediate(() => this.props.onEnd());
        }

        return null;
    }
    componentDidUpdate(prevProps) {
        if (!prevProps.lost && this.props.lost) {
            clearInterval(this.state.timerBite);
            clearTimeout(this.state.timerLose);

            this.setState({ angle: 0, timerLose: this.onLoseAnimation() });
        }
    }
    render() {
        const { gridSize, lost, position, direction } = this.props;

        const pathProps = {
            stroke: 'none',
            fill: 'yellow'
        };

        const radius = gridSize * PLAYER_RADIUS;

        const style = {
            ...cssPosition(position, gridSize),
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius
        };

        const offset = lost
            ? 1
            : direction;

        return (
            <svg className="pacman-player" style={style}>
                <path d={pacmanPath(radius, this.state.angle, offset)} {...pathProps} />
            </svg>
        );
    }
}

Player.propTypes = {
    animate: PropTypes.bool,
    gridSize: PropTypes.number.isRequired,
    lost: PropTypes.bool.isRequired,
    position: PropTypes.array.isRequired,
    direction: PropTypes.number.isRequired,
    onEnd: PropTypes.func
};

