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

function snapToTrack(plane, order, position, tolerance) {
    const snap = order
        ? Math.ceil(position[plane])
        : Math.floor(position[plane]);

    if (Math.abs(snap - position[plane]) > tolerance) {
        return -1;
    }

    return snap;
}

function getChangedVector(oldPosition, newPosition, oldDirection, newDirection) {
    const { plane: oldPlane, order: oldOrder } = orderPolarity(oldDirection);

    const trackTo = snapToTrack(oldPlane, oldOrder, newPosition, TURN_TOLERANCE);
    if (trackTo === -1) {
        return null;
    }

    const old0 = oldPosition[oldPlane];
    const new0 = newPosition[oldPlane];

    if (!(old0 === new0 && Math.abs(trackTo - newPosition[oldPlane]) > 0)) {
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

function distance(posA, posB) {
    // The Pacman board is a kind of manhattan style map, with constraints
    // due to walls

    return Math.abs(posA[0] - posB[0]) + Math.abs(posA[1] - posB[1]);
}

function getAvailableMonsterRoutes({ newPosition, collision, plane, trackTo, monster }) {
    let availableOptions = [];
    let distanceFromTrack = 0;

    if (trackTo !== -1 && tracks[1 - plane][trackTo]) {
        const passedTrack = tracks[1 - plane][trackTo]
            .find(([start, end]) => newPosition[1 - plane] >= start &&
                newPosition[1 - plane] <= end);

        const options = [null, null];
        if (passedTrack[0] < newPosition[1 - plane]) {
            options[0] = plane === 0
                ? SOUTH
                : WEST;
        }
        if (passedTrack[1] > newPosition[1 - plane]) {
            options[1] = plane === 0
                ? NORTH
                : EAST;
        }

        availableOptions = options.filter(item => item !== null);

        distanceFromTrack = Math.abs(newPosition[plane] - trackTo);
    }

    if (!collision) {
        availableOptions.push(monster.direction);
    }

    return { availableOptions, distanceFromTrack };
}

function getAvailableVectors({
    newPosition, plane, trackTo, distanceFromTrack, movedDistance, player, availableOptions
}) {
    return availableOptions.map(direction => {
        const { polarity: optionPolarity, plane: optionPlane } = orderPolarity(direction);

        let position = null;
        if (plane === optionPlane) {
            position = newPosition;
        }
        else {
            position = [];
            position[optionPlane] = newPosition[optionPlane] -
                Math.max(0, movedDistance - distanceFromTrack) * optionPolarity;

            position[1 - optionPlane] = trackTo;
        }

        const compare = [];
        compare[optionPlane] = newPosition[optionPlane] - optionPolarity;
        compare[1 - optionPlane] = position[1 - optionPlane];

        return { compare, position, direction };
    })
        .sort(({ compare: posA }, { compare: posB }) =>
            distance(posA, player.position) - distance(posB, player.position)
        )
        .map(({ direction, position }) => ({ direction, position }));
}

function getNavigatedMonsterVector(newPosition, collision, movedDistance, monster, player) {
    // determine where to move a monster if it has a decision to make
    const { order, plane } = orderPolarity(monster.direction);

    const trackTo = snapToTrack(plane, order, newPosition, movedDistance);
    if (trackTo === -1 && collision) {
        throw new Error('Collided but nothing to track to');
    }

    const { availableOptions, distanceFromTrack } = getAvailableMonsterRoutes({
        newPosition, collision, plane, trackTo, monster
    });

    if (!availableOptions.length) {
        // this happens when wrapping

        return { position: newPosition };
    }

    const vectors = getAvailableVectors({
        newPosition, plane, trackTo, distanceFromTrack, movedDistance, player, availableOptions
    });

    const distanceFromPlayer = distance(vectors[0].position, player.position);

    if (distanceFromPlayer < movedDistance) {
        // player got eaten

        return { lost: true };
    }

    return vectors[0];
}

function getIsHome(monster) {
    return monster.position[0] > MONSTER_HOME_RANGE[WEST] &&
        monster.position[0] < MONSTER_HOME_RANGE[EAST] &&
        monster.position[1] > MONSTER_HOME_RANGE[SOUTH] &&
        monster.position[1] < MONSTER_HOME_RANGE[NORTH];
}

function getNewMonsterVector(monster, player, time) {
    const isHome = getIsHome(monster);

    const { newPosition, collision } = getNewPosition(monster.position, monster.direction,
        MONSTER_SPEED_ATTACK, time, !isHome);

    if (isHome) {
        return getNextMonsterHomePosition(newPosition, monster, player);
    }

    const movedDistance = Math.abs(MONSTER_SPEED_ATTACK * time);

    return getNavigatedMonsterVector(newPosition, collision, movedDistance, monster, player);
}

function animateMonster(state, time, monster, index) {
    const { lost, ...monsterVector } = getNewMonsterVector(monster, state.player, time);

    const newMonster = {
        ...monster,
        ...monsterVector
    };

    const newMonsters = state.monsters.slice();
    newMonsters[index] = newMonster;

    return {
        ...state,
        lost: state.lost || Boolean(lost),
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

