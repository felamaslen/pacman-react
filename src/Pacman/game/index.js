import { EAST, NORTH, WEST, SOUTH } from '../constants';
import { orderPolarityHorizontal } from '../helpers';
import * as tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second

function getEatenFoodHorizontal(direction, food, oldPosition, newPosition) {
    const [posXA, posYA] = oldPosition;
    const [posXB] = newPosition;

    const { polarity } = orderPolarityHorizontal(direction);

    return food.findIndex(({ position: [posX, posY], eaten }) => !eaten &&
        posY === posYA &&
        polarity * posX <= polarity * posXA &&
        polarity * posX >= polarity * posXB);
}

export function hitWallHorizontal(track, { order, polarity }, oldPosX, newPosX) {
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

function getNewPositionHorizontal(direction, player, time) {
    const newPosY = Math.floor(player.position[1]);
    const track = tracks.rows[newPosY];

    const { order, polarity } = orderPolarityHorizontal(direction);

    const newPosX = hitWallHorizontal(track, { order, polarity }, player.position[0],
        player.position[0] - polarity * PLAYER_SPEED * time);

    return [newPosX, newPosY];
}

function animatePlayer(state, time) {
    const { player } = state;

    const direction = player.direction;
    const horizontal = direction % 2 === 0;
    const vertical = !horizontal;

    if (horizontal) {
        const newPosition = getNewPositionHorizontal(direction, player, time);

        const eatenFoodIndex = getEatenFoodHorizontal(direction, state.food, player.position, newPosition);

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

