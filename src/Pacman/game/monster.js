import * as constants from '../constants';
import tracks from './tracks';
import { gridDistance, orderPolarity, getNewPosition, snapToTrack } from './movement';

function getAvailableVectors({
    newPosition,
    plane,
    trackTo,
    distanceFromTrack,
    movedDistance,
    availableOptions,
    player,
    eating
}) {
    return availableOptions.map(direction => {
        const { polarity: optionPolarity, plane: optionPlane } = orderPolarity(direction);

        let position = null;
        if (plane === optionPlane) {
            position = newPosition;
        }
        else {
            position = [];
            position[optionPlane] = newPosition[optionPlane] +
                Math.max(0, movedDistance - distanceFromTrack) * optionPolarity;

            position[1 - optionPlane] = trackTo;
        }

        const compare = [];
        compare[optionPlane] = newPosition[optionPlane] + optionPolarity;
        compare[1 - optionPlane] = position[1 - optionPlane];

        return { compare, position, direction };
    })
        .sort(({ compare: posA }, { compare: posB }) => (-1) ** (eating >> 0) * (
            gridDistance(posA, player.position) - gridDistance(posB, player.position)
        ))
        .map(({ direction, position }) => ({ direction, position }));
}

function getNextMonsterHomePosition(newPosition, monster, player) {
    if ((monster.direction === constants.EAST &&
        monster.position[0] < constants.MONSTER_HOME_EXIT_COL &&
        newPosition[0] >= constants.MONSTER_HOME_EXIT_COL) ||

        (monster.direction === constants.WEST &&
        monster.position[0] > constants.MONSTER_HOME_EXIT_COL &&
        newPosition[0] <= constants.MONSTER_HOME_EXIT_COL)
    ) {

        return {
            position: [constants.MONSTER_HOME_EXIT_COL, newPosition[1]],
            direction: constants.NORTH
        };
    }
    if (monster.direction === constants.NORTH &&
        monster.position[1] < constants.MONSTER_HOME_RANGE[constants.NORTH] &&
        newPosition[1] >= constants.MONSTER_HOME_RANGE[constants.NORTH]) {

        return {
            position: [newPosition[0], constants.MONSTER_HOME_RANGE[constants.NORTH]],
            direction: !monster.directionBias && monster.position[0] < player.position[0]
                ? constants.EAST
                : constants.WEST
        };
    }

    return { position: newPosition };
}

function getIsHome(monster) {
    return monster.position[0] > constants.MONSTER_HOME_RANGE[constants.WEST] &&
        monster.position[0] < constants.MONSTER_HOME_RANGE[constants.EAST] &&
        monster.position[1] > constants.MONSTER_HOME_RANGE[constants.SOUTH] &&
        monster.position[1] < constants.MONSTER_HOME_RANGE[constants.NORTH];
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
                ? constants.SOUTH
                : constants.WEST;
        }
        if (passedTrack[1] > newPosition[1 - plane]) {
            options[1] = plane === 0
                ? constants.NORTH
                : constants.EAST;
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
        newPosition,
        plane,
        trackTo,
        distanceFromTrack,
        movedDistance,
        availableOptions,
        player,
        eating: monster.eatingTime > 0
    });

    const distanceFromPlayer = gridDistance(vectors[0].position, player.position);

    if (distanceFromPlayer < constants.PLAYER_RADIUS * 1.8) {
        if (monster.eatingTime) {
            // monster got eaten

            return { deadTime: constants.MONSTER_DEATH_TIME_SECONDS };
        }

        // player got eaten
        return { lost: true };
    }

    return vectors[0];
}

function getNewMonsterVector(monster, player, time) {
    if (monster.deadTime > time) {
        return {
            ...monster,
            deadTime: monster.deadTime - time
        };
    }
    if (monster.deadTime > 0) {
        return {
            ...monster,
            deadTime: 0,
            eatingTime: 0,
            position: monster.startingPosition,
            direction: monster.startingDirection
        };
    }

    const eatingTime = Math.max(0, monster.eatingTime - time);

    const isHome = getIsHome(monster);

    const speed = monster.eatingTime
        ? constants.MONSTER_SPEED_RETREAT
        : constants.MONSTER_SPEED_ATTACK;

    try {
        const { newPosition, collision, movedDistance } = getNewPosition(
            monster.position, monster.direction, speed, time, !isHome);

        if (isHome) {
            return getNextMonsterHomePosition(newPosition, monster, player);
        }

        return {
            ...getNavigatedMonsterVector(newPosition, collision, movedDistance, monster, player),
            eatingTime
        };
    }
    catch (err) {
        // wrapped or something

        return {};
    }
}

function animateMonster(state, time, player, monster, index) {
    const { lost, ...monsterVector } = getNewMonsterVector(monster, player, time);

    const newMonsters = state.monsters.slice();

    newMonsters[index] = {
        ...monster,
        ...monsterVector
    };

    if (lost) {
        return { ...state, lost: true };
    }

    return { ...state, monsters: newMonsters };
}

export function animateMonsters(state, time, player) {
    return state.monsters.reduce((lastState, monster, index) =>
        animateMonster(lastState, time, player, monster, index), state);
}

