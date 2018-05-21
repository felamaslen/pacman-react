import { EAST, NORTH, WEST, SOUTH } from '../constants';
import tracks from './tracks';
import { gridDistance, orderPolarity, getNewPosition, snapToTrack } from './movement';

const MONSTER_SPEED_ATTACK = 2;
const MONSTER_SPEED_RETREAT = 1.5;

const MONSTER_HOME_RANGE = [17, 18, 8, 12];
const MONSTER_HOME_EXIT_COL = 12.5;

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
            gridDistance(posA, player.position) - gridDistance(posB, player.position)
        )
        .map(({ direction, position }) => ({ direction, position }));
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

function getIsHome(monster) {
    return monster.position[0] > MONSTER_HOME_RANGE[WEST] &&
        monster.position[0] < MONSTER_HOME_RANGE[EAST] &&
        monster.position[1] > MONSTER_HOME_RANGE[SOUTH] &&
        monster.position[1] < MONSTER_HOME_RANGE[NORTH];
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

    const distanceFromPlayer = gridDistance(vectors[0].position, player.position);

    if (distanceFromPlayer < movedDistance) {
        // player got eaten

        return { lost: true };
    }

    return vectors[0];
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

export function animateMonsters(state, time) {
    return state.monsters.reduce((lastState, monster, index) =>
        animateMonster(lastState, time, monster, index), state);
}

