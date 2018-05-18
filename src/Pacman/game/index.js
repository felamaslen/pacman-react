import { orderPolarity } from '../helpers';
import tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second

function getEatenFood(food, player, newPosition) {
    const { plane, polarity } = orderPolarity(player.direction);

    return food.findIndex(({ position, eaten }) => !eaten &&
        position[1 - plane] === player.position[1 - plane] &&
        polarity * position[plane] <= polarity * player.position[plane] &&
        polarity * position[plane] >= polarity * newPosition[plane]
    );
}

function getNewPosition(player, time) {
    const { order, plane, polarity } = orderPolarity(player.direction);

    const newPosition = player.position.slice();

    newPosition[1 - plane] = Math.floor(newPosition[1 - plane]);
    newPosition[plane] -= polarity * PLAYER_SPEED * time;

    const track = tracks[plane][newPosition[1 - plane]];

    const trackHit = track.findIndex(limits =>
        player.position[plane] >= limits[0] &&
        player.position[plane] <= limits[1] &&
        polarity * newPosition[plane] < polarity * limits[order]
    );

    if (trackHit === (track.length - 1) * order && track[trackHit][2]) {
        // wrap
        newPosition[plane] = track[(track.length - 1) * (1 - order)][1 - order];
    }
    else if (trackHit > -1) {
        newPosition[plane] = track[trackHit][order];
    }

    return newPosition;
}

function animatePlayer(state, time) {
    const newPosition = getNewPosition(state.player, time);
    const eatenFoodIndex = getEatenFood(state.food, state.player, newPosition);
    const food = state.food.slice();
    if (eatenFoodIndex > -1) {
        food[eatenFoodIndex].eaten = true;
    }

    return {
        ...state,
        player: {
            ...state.player,
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

