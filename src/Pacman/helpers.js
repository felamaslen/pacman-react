import { BOARD_HEIGHT } from './constants';

export function cssPosition(position, gridSize) {
    return {
        left: (position[0] + 1.5) * gridSize,
        top: (BOARD_HEIGHT - position[1] - 3) * gridSize
    };
}

export function orderPolarity(direction) {
    const order = (direction < 2) >> 0;
    const polarity = (-1) ** order;

    return { order, polarity };
}


