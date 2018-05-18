export function animate(state) {
    // get the next game state as a function of time

    const now = Date.now();

    return {
        ...state,
        stepTime: now,
        eating: !state.eating
    };
}

