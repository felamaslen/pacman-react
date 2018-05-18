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

function hitWallEast(posY, oldPosX, newPosX) {
    const track = tracks.rows[posY];

    const trackHit = track.findIndex(([colA, colB]) =>
        oldPosX >= colA && oldPosX <= colB && newPosX > colB);

    if (trackHit === track.length - 1 && track[trackHit][2]) {
        // wrap
        return track[0][0];
    }

    if (trackHit === -1) {
        return newPosX;
    }

    return track[trackHit][1];
}
function hitWallWest(posY, oldPosX, newPosX) {
    const track = tracks.rows[posY];

    const trackHit = track.findIndex(([colA, colB]) =>
        oldPosX >= colA && oldPosX <= colB && newPosX < colA);

    if (trackHit === 0 && track[trackHit][2]) {
        // wrap
        return track[track.length - 1][1];
    }

    if (trackHit === -1) {
        return newPosX;
    }

    return track[trackHit][0];
}

function getNewPositionEast(player, time) {
    const newPosY = Math.floor(player.position[1]);
    const newPosX = hitWallEast(newPosY, player.position[0], player.position[0] + PLAYER_SPEED * time);

    return [newPosX, newPosY];
}
function getNewPositionWest(player, time) {
    const newPosY = Math.floor(player.position[1]);
    const newPosX = hitWallWest(newPosY, player.position[0], player.position[0] - PLAYER_SPEED * time);

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

