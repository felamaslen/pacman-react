import { DIRECTION_EAST, DIRECTION_NORTH, DIRECTION_WEST, DIRECTION_SOUTH } from '../constants';
import * as tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second

function getEatenFoodEast(food, oldPosition, newPosition) {
    const [posXA, posYA] = oldPosition;
    const [posXB] = newPosition;

    return food.findIndex(({ position: [posX, posY], eaten }) => !eaten &&
        posY === posYA && posX >= posXA && posX <= posXB);
}
function getEatenFoodWest(food, oldPosition, newPosition) {
    const [posXA, posYA] = oldPosition;
    const [posXB] = newPosition;

    return food.findIndex(({ position: [posX, posY], eaten }) => !eaten &&
        posY === posYA && posX <= posXA && posX >= posXB);
}

export function hitWallHorizontal(track, direction, oldPosX, newPosX) {
    const order = (direction < 2) >> 0; // east -> 1, west -> 0
    const polarity = (-1) ** order; // east -> -1, west -> 1

    const trackHit = track.findIndex(col =>
        oldPosX >= col[0] && oldPosX <= col[1] && polarity * newPosX < polarity * col[order]);

    if (trackHit === (track.length - 1) * order && track[trackHit][2]) {
        // wrap
        return track[(track.length - 1) * (1 - order)][1 - order];
    }

    if (trackHit === -1) {
        return newPosX;
    }

    return track[trackHit][order];
}

function getNewPositionEast(player, time) {
    const newPosY = Math.floor(player.position[1]);

    const track = tracks.rows[newPosY];

    const newPosX = hitWallHorizontal(track, DIRECTION_EAST, player.position[0], player.position[0] + PLAYER_SPEED * time);

    return [newPosX, newPosY];
}
function getNewPositionWest(player, time) {
    const newPosY = Math.floor(player.position[1]);

    const track = tracks.rows[newPosY];

    const newPosX = hitWallHorizontal(track, DIRECTION_WEST, player.position[0], player.position[0] - PLAYER_SPEED * time);

    return [newPosX, newPosY];
}

function animatePlayer(state, time) {
    const { player } = state;

    const direction = player.direction;
    const horizontal = direction % 2 === 0;
    const vertical = !horizontal;

    if (direction === DIRECTION_EAST) {
        const newPosition = getNewPositionEast(player, time);

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
    if (direction === DIRECTION_WEST) {
        const newPosition = getNewPositionWest(player, time);

        const eatenFoodIndex = getEatenFoodWest(state.food, player.position, newPosition);

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

