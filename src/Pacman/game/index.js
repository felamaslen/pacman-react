import walls from '../Board/Walls/walls.json';
import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from '../constants';

const PLAYER_SPEED = 1; // dots per second

function getEatenFoodEast(food, oldPosition, newPosition) {
    const [posXA, posYA] = oldPosition;
    const [posXB] = newPosition;

    return food.findIndex(({ position: [posX, posY], eaten }) => !eaten &&
        posY === posYA && posX >= posXA && posX <= posXB);
}

function animatePlayer(state, time) {
    const { player } = state;

    const direction = player.direction;
    const horizontal = direction % 2 === 0;
    const vertical = !horizontal;

    if (direction === DIRECTION_EAST) {
        const newPosition = [
            player.position[0] + PLAYER_SPEED * time,
            Math.floor(player.position[1])
        ];

        const eatenFoodIndex = getEatenFoodEast(state.food, player.position, newPosition);

        const food = state.food.slice();
        if (eatenFoodIndex > -1) {
            food[eatenFoodIndex].eaten = true;
        }

        return {
            ...state,
            player: {
                ...player,
                position: newPosition
            },
            food
        };
    }

    return state;
}

export function animate(state, { time = Date.now() } = {}) {
    // get the next game state as a function of time

    const timeSeconds = (time - state.stepTime) / 1000;

    const statePlayerAnimated = animatePlayer({ ...state, stepTime: time }, timeSeconds);

    return statePlayerAnimated;
}

