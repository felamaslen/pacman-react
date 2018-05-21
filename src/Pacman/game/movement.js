import tracks from './tracks';

const TURN_TOLERANCE = 0.1;

export function gridDistance(posA, posB) {
    // The Pacman board is a kind of manhattan style map, with constraints
    // due to walls

    return Math.abs(posA[0] - posB[0]) + Math.abs(posA[1] - posB[1]);
}

export function orderPolarity(direction) {
    const order = (direction < 2) >> 0;
    const polarity = (-1) ** order;
    const plane = direction % 2;

    return { order, polarity, plane };
}

export function getNewPosition(position, direction, speed, time, toNearestPlane = true) {
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

export function snapToTrack(plane, order, position, tolerance) {
    const snap = order
        ? Math.ceil(position[plane])
        : Math.floor(position[plane]);

    if (Math.abs(snap - position[plane]) > tolerance) {
        return -1;
    }

    return snap;
}

export function getChangedVector(oldPosition, newPosition, oldDirection, newDirection) {
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

