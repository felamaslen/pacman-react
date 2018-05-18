import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cssPosition } from '../helpers';
import './style.scss';

function pacmanPath(radius, angle, offset) {
    const offsetX = radius * Math.cos(angle / 2);
    const offsetY = radius * Math.sin(angle / 2);

    const polarity = (-1) ** Math.floor(offset / 2);

    const m00 = ((offset + 1) % 2) * polarity;
    const m01 = (offset % 2) * polarity;

    const biteX1 = offsetX * m00 - offsetY * m01;
    const biteY1 = -offsetX * m01 - offsetY * m00;
    const biteX2 = offsetX * m00 + offsetY * m01;
    const biteY2 = -offsetX * m01 + offsetY * m00;

    return [
        `M${radius},${radius}`,
        `L${radius + biteX1},${radius + biteY1}`,
        `A${radius},${radius}`,
        `0 1 0`,
        `${radius + biteX2},${radius + biteY2}`,
        `L${radius},${radius}`
    ]
        .join(' ');
}

export default class Player extends Component {
    constructor(props) {
        super(props);

        this.state = {
            angle: 1
        };

        this.startTime = Date.now();
        this.timer = null;
    }
    componentDidMount() {
        if (this.props.animate) {
            this.timer = setInterval(() => {
                this.setState({
                    angle: 1 + 0.5 * Math.sin((Date.now() - this.startTime) / 50)
                });
            }, 30);
        }
    }
    componentWillUnmount() {
        clearInterval(this.timer);
    }
    render() {
        const { gridSize, position, direction } = this.props;

        const pathProps = {
            stroke: 'none',
            fill: 'yellow'
        };

        const radius = gridSize * 0.8;

        const style = {
            ...cssPosition(position, gridSize),
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius
        };

        return (
            <svg className="pacman-player" style={style}>
                <path d={pacmanPath(radius, this.state.angle, direction)} {...pathProps} />
            </svg>
        );
    }
}

Player.propTypes = {
    animate: PropTypes.bool,
    gridSize: PropTypes.number.isRequired,
    position: PropTypes.array.isRequired,
    direction: PropTypes.number.isRequired
};

