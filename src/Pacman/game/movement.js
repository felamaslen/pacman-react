import tracks from './tracks';

export function gridDistance(posA, posB) {
    // The Pacman board is a kind of manhattan style map, with constraints
    // due to walls

    return Math.abs(posA[0] - posB[0]) + Math.abs(posA[1] - posB[1]);
}

export function orderPolarity(direction) {
    const order = (direction < 2) >> 0;
    const polarity = (-1) ** (1 - order);
    const plane = direction % 2;

    return { order, polarity, plane };
}

export function getNewPosition(position, direction, speed, time, toNearestPlane = true) {
    const { order, plane, polarity } = orderPolarity(direction);

    const newPosition = position.slice();
    const movedVector = polarity * speed * time;
    let movedDistance = Math.abs(movedVector);

    const nearestOtherPlane = Math.round(newPosition[1 - plane]);
    if (toNearestPlane) {
        newPosition[1 - plane] = nearestOtherPlane;
    }

    newPosition[plane] += movedVector;

    const track = tracks[plane][nearestOtherPlane];

    const trackHit = track.findIndex(limits =>
        position[plane] >= limits[0] &&
        position[plane] <= limits[1] &&
        polarity * newPosition[plane] > polarity * limits[order]
    );

    let collision = false;

    if (trackHit === (track.length - 1) * order && track[trackHit][2]) {
        // wrap
        newPosition[plane] = track[(track.length - 1) * (1 - order)][1 - order];

        movedDistance = speed * time;
    }
    else if (trackHit > -1) {
        newPosition[plane] = track[trackHit][order];

        movedDistance = Math.abs(position[plane] - track[trackHit][order]);

        collision = true;
    }

    return { newPosition, collision, movedDistance };
}

export function snapToTrack(plane, order, position, tolerance) {
    const snap = order
        ? Math.ceil(position[plane])
        : Math.floor(position[plane]);

    if (Math.abs(snap - position[plane]) > tolerance) {
        return -1;
    }

    return snap;
}

export function getChangedVector(oldPosition, newPosition, oldDirection, newDirection, movedDistance) {
    const { plane: oldPlane, order: oldOrder } = orderPolarity(oldDirection);

    const trackTo = snapToTrack(oldPlane, oldOrder, newPosition, movedDistance);
    if (trackTo === -1) {
        return null;
    }

    const old0 = oldPosition[oldPlane];
    const new0 = newPosition[oldPlane];

    const movedDistanceBeforeTurn = Math.abs(trackTo - newPosition[oldPlane]);

    if (!(old0 === new0 && movedDistanceBeforeTurn > movedDistance)) {
        const { order: newOrder, plane: newPlane, polarity } = orderPolarity(newDirection);

        const track = tracks[newPlane][trackTo];
        if (!track) {
            return null;
        }

        const trackHit = track.findIndex(limits =>
            newPosition[newPlane] >= limits[0] &&
            newPosition[newPlane] <= limits[1] &&
            (1 - newOrder) * newPosition[newPlane] >= (limits[0] - polarity) * (1 - newOrder) &&
            newOrder * newPosition[newPlane] <= (limits[1] - polarity) * newOrder
        );

        if (trackHit > -1) {
            const changedVector = newPosition.slice();

            changedVector[oldPlane] = trackTo;
            changedVector[newPlane] += polarity * (movedDistance - movedDistanceBeforeTurn);

            return changedVector;
        }
    }

    return null;
}

