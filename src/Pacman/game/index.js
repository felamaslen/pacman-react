import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from '../constants';
import * as tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second

function getEatenFoodEast(food, oldPosition, newPosition) {
    const [posXA, posYA] = oldPosition;
    const [posXB] = newPosition;

    return food.findIndex(({ position: [posX, posY], eaten }) => !eaten &&
        posY === posYA && posX >= posXA && posX <= posXB);
}

function hitWallEast(posY, oldPosX, newPosX) {
    const track = tracks.rows[posY];

    const trackHit = track.slice(1)
        .findIndex((col, index) => oldPosX >= track[index] && oldPosX <= col &&
            newPosX > col);

    if (trackHit === -1) {
        if (track[track.length - 2] === Infinity && newPosX > track[track.length - 1]) {
            return track[0];
        }

        return null;
    }

    return track[trackHit + 1];
}

function getNewPositionEast(player, walls, time) {
    let newPosX = player.position[0] + PLAYER_SPEED * time;
    const newPosY = Math.floor(player.position[1]);

    const wallCollision = hitWallEast(newPosY, player.position[0], newPosX);
    if (wallCollision) {
        newPosX = wallCollision;
    }

    return [newPosX, newPosY];
}

function animatePlayer(state, time) {
    const { player } = state;

    const direction = player.direction;
    const horizontal = direction % 2 === 0;
    const vertical = !horizontal;

    if (direction === DIRECTION_EAST) {
        const newPosition = getNewPositionEast(player, state.walls, time);

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

export function changeDirection(state, { direction }) {
    return {
        ...state,
        player: {
            ...state.player,
            direction
        }
    };
}

