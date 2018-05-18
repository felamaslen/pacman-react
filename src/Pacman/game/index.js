import { orderPolarity } from '../helpers';
import tracks from './tracks';

const PLAYER_SPEED = 1; // dots per second
const TURN_TOLERANCE = 0.1;

function getEatenFood(food, player, newPosition) {
    const { plane, polarity } = orderPolarity(player.direction);

    return food.findIndex(({ position, eaten }) => !eaten &&
        position[1 - plane] === player.position[1 - plane] &&
        polarity * position[plane] <= polarity * player.position[plane] &&
        polarity * position[plane] >= polarity * newPosition[plane]
    );
}

function getChangedVector(oldPosition, newPosition, oldDirection, newDirection) {
    const { plane: oldPlane, order: oldOrder } = orderPolarity(oldDirection);

    const trackTo = oldOrder
        ? Math.ceil(newPosition[oldPlane])
        : Math.floor(newPosition[oldPlane]);

    const cornerDifference = Math.abs(trackTo - newPosition[oldPlane]);
    if (cornerDifference > TURN_TOLERANCE) {
        return null;
    }

    const old0 = oldPosition[oldPlane];
    const new0 = newPosition[oldPlane];

    if (!(old0 === new0 && cornerDifference > 0)) {
        const { order: newOrder, plane: newPlane, polarity } = orderPolarity(newDirection);

        const track = tracks[newPlane][trackTo];

        const trackHit = track.findIndex(limits =>
            newPosition[newPlane] >= limits[0] &&
            newPosition[newPlane] <= limits[1] &&
            (1 - newOrder) * newPosition[newPlane] >= (limits[0] + polarity) * (1 - newOrder) &&
            newOrder * newPosition[newPlane] <= (limits[1] + polarity) * newOrder
        );

        if (trackHit > -1) {
            const changedVector = newPosition.slice();

            changedVector[oldPlane] = trackTo;

            return changedVector;
        }
    }

    return null;
}

function getNewPosition(player, time) {
    const { order, plane, polarity } = orderPolarity(player.direction);

    const newPosition = player.position.slice();

    newPosition[1 - plane] = Math.round(newPosition[1 - plane]);

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

    if (player.nextDirection !== player.direction) {
        const changedVector = getChangedVector(player.position, newPosition,
            player.direction, player.nextDirection);

        if (changedVector) {
            return { position: changedVector, direction: player.nextDirection };
        }
    }

    return { position: newPosition };
}

function animatePlayer(state, time) {
    const newVector = getNewPosition(state.player, time);
    const eatenFoodIndex = getEatenFood(state.food, state.player, newVector.position);
    const food = state.food.slice();
    if (eatenFoodIndex > -1) {
        food[eatenFoodIndex].eaten = true;
    }

    return {
        ...state,
        player: {
            ...state.player,
            ...newVector
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
    const orderPolarityOld = orderPolarity(state.player.direction);
    const orderPolarityNew = orderPolarity(direction);

    if (orderPolarityOld.plane === orderPolarityNew.plane) {
        return {
            ...state,
            player: {
                ...state.player,
                direction,
                nextDirection: direction
            }
        };
    }

    return {
        ...state,
        player: {
            ...state.player,
            nextDirection: direction
        }
    };
}

