import { BOARD_HEIGHT } from './constants';

export function cssPosition(position, gridSize) {
    return {
        left: (position[0] + 1.5) * gridSize,
        top: (BOARD_HEIGHT - position[1] - 3) * gridSize
    };
}

