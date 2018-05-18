import { orderPolarity } from '../helpers';
import * as tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second

function getEatenFood(direction, food, oldPosition, newPosition) {
    const { plane, polarity } = orderPolarity(direction);

    return food.findIndex(({ position, eaten }) => !eaten &&
        position[1 - plane] === oldPosition[1 - plane] &&
        polarity * position[plane] <= polarity * oldPosition[plane] &&
        polarity * position[plane] >= polarity * newPosition[plane]
    );
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
export function hitWallVertical(track, { order, polarity }, oldPosY, newPosY) {
    const trackHit = track.findIndex(col =>
        oldPosY >= col[0] && oldPosY <= col[1] && polarity * newPosY < polarity * col[order]);

    if (trackHit === (track.length - 1) * order && track[trackHit][2]) {
        // wrap
        return track[(track.length - 1) * (1 - order)][1 - order];
    }

    if (trackHit === -1) {
        return newPosY;
    }

    return track[trackHit][order];
}

function getNewPositionHorizontal(direction, player, time) {
    const newPosY = Math.floor(player.position[1]);
    const track = tracks.rows[newPosY];

    const { order, polarity } = orderPolarity(direction);

    const newPosX = hitWallHorizontal(track, { order, polarity }, player.position[0],
        player.position[0] - polarity * PLAYER_SPEED * time);

    return [newPosX, newPosY];
}
function getNewPositionVertical(direction, player, time) {
    const newPosX = Math.floor(player.position[0]);
    const track = tracks.cols[newPosX];

    const { order, polarity } = orderPolarity(direction);

    const newPosY = hitWallVertical(track, { order, polarity }, player.position[1],
        player.position[1] - polarity * PLAYER_SPEED * time);

    return [newPosX, newPosY];
}

function animatePlayer(state, time) {
    const { player } = state;

    const direction = player.direction;
    const horizontal = direction % 2 === 0;

    if (horizontal) {
        const newPosition = getNewPositionHorizontal(direction, player, time);

        const eatenFoodIndex = getEatenFood(direction, state.food, player.position, newPosition);

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

    const newPosition = getNewPositionVertical(direction, player, time);

    const eatenFoodIndex = getEatenFood(direction, state.food, player.position, newPosition);

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

