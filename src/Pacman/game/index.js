import { orderPolarity } from './movement';
import { animateMonsters } from './monster';
import { animatePlayer } from './player';

export function animate(state, { time = Date.now() } = {}) {
    // get the next game state as a function of time

    const timeSeconds = (time - state.stepTime) / 1000;

    if (state.lost) {
        return state;
    }

    const statePlayerAnimated = animatePlayer({ ...state, stepTime: time }, timeSeconds);

    const stateMonstersAnimated = animateMonsters(statePlayerAnimated, timeSeconds);

    return stateMonstersAnimated;
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

