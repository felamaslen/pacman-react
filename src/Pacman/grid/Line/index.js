import React from 'react';
import PropTypes from 'prop-types';
import * as constants from '../../constants';

function getCornerArc(cornerArcRadius, clockwise, diffX, diffY) {
    return `a${cornerArcRadius},${cornerArcRadius} 0 0 ${clockwise >> 0} ${diffX},${diffY}`;
}

const pmod = (num, base) => ((num % base) + base) % base;

function getLinePart({ radiusA, radiusB, path, lastDirection, distance, direction, index, end }) {
    const vertical = direction % 2;
    const horizontal = 1 - vertical;

    const reverse = (-1) ** ((direction < 2) >> 0);
    const polarity = (-1) ** vertical;

    const vectorType = ['h', 'v'][vertical];

    if (index === 0) {
        const vector = (radiusB - distance) * reverse * polarity;
        const line = `${vectorType}${vector}`;

        return `${path} ${line}`;
    }

    const vector = (radiusA + radiusB * (!end >> 0) - distance) * reverse * polarity;
    const line = `${vectorType}${vector}`;

    const cornerArcDiffX = radiusA * (
        (-1) ** ((lastDirection === constants.WEST) >> 0) * vertical - reverse * horizontal
    );

    const cornerArcDiffY = radiusA * (
        (-1) ** ((lastDirection === constants.NORTH) >> 0) * horizontal + reverse * vertical
    );

    const clockwise = (pmod(lastDirection - direction, 4) === 1) >> 0;

    const cornerArc = getCornerArc(radiusA, clockwise, cornerArcDiffX, cornerArcDiffY);

    return `${path} ${cornerArc} ${line}`;
}

function getPoint([xValue, yValue], gridSize) {
    return [xValue * gridSize, (constants.BOARD_HEIGHT - yValue) * gridSize];
}

export default function Line({ gridSize, start, parts, ...props }) {
    const startTransformed = getPoint(start, gridSize);

    const partRadius = parts.map(({ radius }) => gridSize / (radius || 3));

    const { path: pathString } = parts.map(({ distance, ...rest }) => ({
        distance: distance * gridSize,
        ...rest
    }))
        .reduce(({ path, lastDirection, lastRadius }, { distance, direction }, index) => ({
            path: getLinePart({
                radiusA: lastRadius,
                radiusB: partRadius[index],
                path,
                lastDirection,
                distance,
                direction,
                index,
                end: index === parts.length - 1
            }),
            lastDirection: direction,
            lastRadius: partRadius[index]
        }), {
            path: `M${startTransformed.join(',')}`
        });

    const pathProps = {
        strokeWidth: props.strokeWidth,
        stroke: props.stroke,
        fill: props.fill
    };

    return (
        <path d={pathString} {...pathProps} />
    );
}

Line.propTypes = {
    strokeWidth: PropTypes.number,
    stroke: PropTypes.string,
    fill: PropTypes.string,
    gridSize: PropTypes.number.isRequired,
    start: PropTypes.array.isRequired,
    parts: PropTypes.array.isRequired
};

