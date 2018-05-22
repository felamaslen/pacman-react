import { PLAYER_SPEED, EATING_TIME_SECONDS } from '../constants';
import { getNewPosition, getChangedVector, orderPolarity } from './movement';

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

function eatMonsters(state) {
    return {
        ...state,
        monsters: state.monsters.map(monster => ({
            ...monster,
            eatingTime: EATING_TIME_SECONDS
        }))
    };
}

export function animatePlayer(state, time) {
    const newVector = getNewPlayerPosition(state.player, time);
    const eatenFoodIndex = getEatenFood(state.food, state.player, newVector.position);
    const food = state.food.slice();
    if (eatenFoodIndex > -1) {
        food[eatenFoodIndex].eaten = true;
    }

    const eating = eatenFoodIndex > -1 && food[eatenFoodIndex].big;

    const nextState = {
        ...state,
        player: {
            ...state.player,
            ...newVector
        },
        food
    };

    if (eating) {
        return eatMonsters(nextState);
    }

    return nextState;
}

