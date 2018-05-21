import { getNewPosition, getChangedVector, orderPolarity } from './movement';

const PLAYER_SPEED = 2; // dots per second

function getEatenFood(food, player, newPosition) {
    const { plane, polarity } = orderPolarity(player.direction);

    return food.findIndex(({ position, eaten }) => !eaten &&
        position[1 - plane] === player.position[1 - plane] &&
        polarity * position[plane] >= polarity * player.position[plane] &&
        polarity * position[plane] <= polarity * newPosition[plane]
    );
}

function getNewPlayerPosition(player, time) {
    const { newPosition, movedDistance } = getNewPosition(player.position, player.direction,
        PLAYER_SPEED, time);

    if (player.nextDirection !== player.direction) {
        const changedVector = getChangedVector(player.position, newPosition,
            player.direction, player.nextDirection, movedDistance);

        if (changedVector) {
            return { position: changedVector, direction: player.nextDirection };
        }
    }

    return { position: newPosition };
}

export function animatePlayer(state, time) {
    const newVector = getNewPlayerPosition(state.player, time);
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

