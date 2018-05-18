import walls from '../Board/Walls/walls.json';
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from '../constants';

const PLAYER_SPEED = 1; // dots per second

function animatePlayer(player, time) {
    const direction = player.direction;
    const horizontal = direction % 2 === 0;
    const vertical = !horizontal;

    if (direction === DIRECTION_EAST) {
        const posY = Math.floor(player.position[1]);

        const posX = player.position[0] + PLAYER_SPEED * time;

        return {
            ...player,
            position: [posX, posY]
        };
    }

    return player;
}

export function animate(state, { time = Date.now() } = {}) {
    // get the next game state as a function of time

    const timeSeconds = (time - state.stepTime) / 1000;

    return {
        ...state,
        stepTime: time,
        player: animatePlayer(state.player, timeSeconds)
    };
}

