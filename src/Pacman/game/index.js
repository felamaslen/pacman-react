import { orderPolarity } from '../helpers';
import tracks from './tracks';
import { EAST, NORTH, WEST, SOUTH } from '../constants';

const PLAYER_SPEED = 2; // dots per second
const MONSTER_SPEED_ATTACK = 2;
const MONSTER_SPEED_RETREAT = 1.5;
const TURN_TOLERANCE = 0.1;

const MONSTER_HOME_RANGE = [17, 18, 8, 12];
const MONSTER_HOME_EXIT_COL = 12.5;

function getEatenFood(food, player, newPosition) {
    const { plane, polarity } = orderPolarity(player.direction);

    return food.findIndex(({ position, eaten }) => !eaten &&
        position[1 - plane] === player.position[1 - plane] &&
        polarity * position[plane] <= polarity * player.position[plane] &&
        polarity * position[plane] >= polarity * newPosition[plane]
    );
}

function getNewPosition(position, direction, speed, time, toNearestPlane = true) {
    const { order, plane, polarity } = orderPolarity(direction);

    const newPosition = position.slice();

    const nearestOtherPlane = Math.round(newPosition[1 - plane]);
    if (toNearestPlane) {
        newPosition[1 - plane] = nearestOtherPlane;
    }

    newPosition[plane] -= polarity * speed * time;

    const track = tracks[plane][nearestOtherPlane];

    const trackHit = track.findIndex(limits =>
        position[plane] >= limits[0] &&
        position[plane] <= limits[1] &&
        polarity * newPosition[plane] < polarity * limits[order]
    );

    let collision = false;

    if (trackHit === (track.length - 1) * order && track[trackHit][2]) {
        // wrap
        newPosition[plane] = track[(track.length - 1) * (1 - order)][1 - order];
    }
    else if (trackHit > -1) {
        newPosition[plane] = track[trackHit][order];

        collision = true;
    }

    return { newPosition, collision };
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

function getNewPlayerPosition(player, time) {
    const { newPosition } = getNewPosition(player.position, player.direction,
        PLAYER_SPEED, time);

    if (player.nextDirection !== player.direction) {
        const changedVector = getChangedVector(player.position, newPosition,
            player.direction, player.nextDirection);

        if (changedVector) {
            return { position: changedVector, direction: player.nextDirection };
        }
    }

    return { position: newPosition };
}

function getNextMonsterHomePosition(newPosition, monster, player) {
    if ((monster.direction === EAST &&
        monster.position[0] < MONSTER_HOME_EXIT_COL &&
        newPosition[0] >= MONSTER_HOME_EXIT_COL) ||

        (monster.direction === WEST &&
        monster.position[0] > MONSTER_HOME_EXIT_COL &&
        newPosition[0] <= MONSTER_HOME_EXIT_COL)
    ) {

        return {
            position: [MONSTER_HOME_EXIT_COL, newPosition[1]],
            direction: NORTH
        };
    }
    if (monster.direction === NORTH &&
        monster.position[1] < MONSTER_HOME_RANGE[NORTH] &&
        newPosition[1] >= MONSTER_HOME_RANGE[NORTH]) {

        return {
            position: [newPosition[0], MONSTER_HOME_RANGE[NORTH]],
            direction: monster.position[0] < player.position[0]
                ? EAST
                : WEST
        };
    }

    return { position: newPosition };
}

function getNavigatedMonsterPosition(newPosition, monster, player) {
    const { order, plane, polarity } = orderPolarity(monster.direction);

    const nextTrack = tracks[1 - plane][newPosition[plane]]
        .find(([start, end ]) => newPosition[1 - plane] >= start &&
            newPosition[1 - plane] <= end);

    const options = [null, null];
    if (nextTrack[0] < newPosition[1 - plane]) {
        options[0] = plane === 0
            ? SOUTH
            : WEST;
    }
    if (nextTrack[1] > newPosition[1 - plane]) {
        options[1] = plane === 0
            ? NORTH
            : EAST;
    }

    if (options[0] === null || options[1] === null) {
        return { direction: options.find(item => item !== null) };
    }

    if (newPosition[1 - plane] < player.position[1 - plane]) {
        return { direction: options[1] };
    }

    return { direction: options[0] };
}

function getIsHome(monster) {
    return monster.position[0] > MONSTER_HOME_RANGE[WEST] &&
        monster.position[0] < MONSTER_HOME_RANGE[EAST] &&
        monster.position[1] > MONSTER_HOME_RANGE[SOUTH] &&
        monster.position[1] < MONSTER_HOME_RANGE[NORTH];
}

function getNewMonsterPosition(monster, player, time) {
    const isHome = getIsHome(monster);

    const { newPosition, collision } = getNewPosition(monster.position, monster.direction,
        MONSTER_SPEED_ATTACK, time, !isHome);

    if (isHome) {
        return getNextMonsterHomePosition(newPosition, monster, player);
    }
    if (collision) {
        return getNavigatedMonsterPosition(newPosition, monster, player);
    }

    return { position: newPosition };
}

function animateMonster(state, time, monster, index) {
    const newMonster = {
        ...monster,
        ...getNewMonsterPosition(monster, state.player, time)
    };

    const newMonsters = state.monsters.slice();
    newMonsters[index] = newMonster;

    return {
        ...state,
        monsters: newMonsters
    };
}

function animateMonsters(state, time) {
    return state.monsters.reduce((lastState, monster, index) =>
        animateMonster(lastState, time, monster, index), state);
}

function animatePlayer(state, time) {
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

export function animate(state, { time = Date.now() } = {}) {
    // get the next game state as a function of time

    const timeSeconds = (time - state.stepTime) / 1000;

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

