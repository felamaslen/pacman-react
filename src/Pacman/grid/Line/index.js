import React from 'react';
import PropTypes from 'prop-types';
import * as constants from '../../constants';

function getCornerArc(cornerArcRadius, clockwise, diffX, diffY) {
    return `a${cornerArcRadius},${cornerArcRadius} 0 0 ${clockwise >> 0} ${diffX},${diffY}`;
}

const pmod = (num, base) => ((num % base) + base) % base;

function getLinePart({ cornerArcRadius, path, lastDirection, distance, direction, index, end }) {
    const vertical = direction % 2;
    const horizontal = 1 - vertical;

    const reverse = (-1) ** ((direction < 2) >> 0);
    const polarity = (-1) ** vertical;
    if (index === 0) {
        const vector = (cornerArcRadius - distance) * reverse * polarity;
        const line = `h${vector}`;

        return `${path} ${line}`;
    }

    const vector = (cornerArcRadius * 2 * (!end >> 0) - distance) * reverse * polarity;
    const line = `${['h', 'v'][vertical]}${vector}`;

    const cornerArcDiffX = cornerArcRadius * (
        (-1) ** ((lastDirection === constants.DIRECTION_WEST) >> 0) * vertical - reverse * horizontal
    );

    const cornerArcDiffY = cornerArcRadius * (
        (-1) ** ((lastDirection === constants.DIRECTION_NORTH) >> 0) * horizontal + reverse * vertical
    );

    const clockwise = (pmod(lastDirection - direction, 4) === 1) >> 0;

    const cornerArc = getCornerArc(cornerArcRadius, clockwise, cornerArcDiffX, cornerArcDiffY);

    return `${path} ${cornerArc} ${line}`;
}

function getPoint([xValue, yValue], gridSize) {
    return [xValue * gridSize, (constants.BOARD_HEIGHT - yValue) * gridSize];
}

export default function Line({ gridSize, start, parts, ...props }) {
    const startTransformed = getPoint(start, gridSize);

    const cornerArcRadius = gridSize / 2;

    const { path: pathString } = parts.map(({ distance, ...rest }) => ({
        distance: distance * gridSize,
        ...rest
    }))
        .reduce(({ path, lastDirection }, { distance, direction }, index) => ({
            path: getLinePart({
                cornerArcRadius,
                path,
                lastDirection,
                distance,
                direction,
                index,
                end: index === parts.length - 1
            }),
            lastDirection: direction
        }), {
            path: `M${startTransformed.join(',')}`
        });

    return (
        <path d={pathString} {...props} />
    );
}

Line.propTypes = {
    gridSize: PropTypes.number.isRequired,
    start: PropTypes.array.isRequired,
    parts: PropTypes.array.isRequired
};

