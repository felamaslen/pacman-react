import { EAST, NORTH, WEST, SOUTH } from './constants';

function isBigFood([posX, posY]) {
    return (posX === 0 || posX === 25) && (posY === 6 || posY === 26);
}

function generateFood() {
    const genRow = (startX, posY, num) => new Array(num).fill(0)
        .map((item, index) => ([startX + index, posY]));

    const genDisparateRow = (xPoints, posY) => xPoints
        .map(posX => ([posX, posY]));

    const genContinuousRow = (ranges, posY) => ranges
        .reduce((items, [startX, num]) => ([
            ...items, ...genRow(startX, posY, num)
        ]), []);

    const genCol = (posX, startY, num) => new Array(num).fill(0)
        .map((item, index) => ([posX, startY + index]));

    return [
        ...genRow(0, 0, 26),
        ...genDisparateRow([0, 11, 14, 25], 1),
        ...genDisparateRow([0, 11, 14, 25], 2),
        ...genContinuousRow([[0, 6], [8, 4], [14, 4], [20, 6]], 3),
        ...genDisparateRow([2, 5, 8, 17, 20, 23], 4),
        ...genDisparateRow([2, 5, 8, 17, 20, 23], 5),
        ...genContinuousRow([[0, 3], [5, 7], [14, 7], [23, 3]], 6),
        ...genDisparateRow([0, 5, 11, 14, 20, 25], 7),
        ...genDisparateRow([0, 5, 11, 14, 20, 25], 8),
        ...genContinuousRow([[0, 12], [14, 12]], 9),
        ...genCol(5, 10, 11),
        ...genCol(20, 10, 11),
        ...genContinuousRow([[0, 6], [8, 4], [14, 4], [20, 6]], 21),
        ...genDisparateRow([0, 5, 8, 17, 20, 25], 22),
        ...genDisparateRow([0, 5, 8, 17, 20, 25], 23),
        ...genRow(0, 24, 26),
        ...genDisparateRow([0, 5, 11, 14, 20, 25], 25),
        ...genDisparateRow([0, 5, 11, 14, 20, 25], 26),
        ...genDisparateRow([0, 5, 11, 14, 20, 25], 27),
        ...genContinuousRow([[0, 12], [14, 12]], 28)
    ]
        .map((position, index) => ({
            key: index,
            position,
            eaten: false,
            big: isBigFood(position)
        }));
}

export default function getInitialState() {
    return {
        stepTime: Date.now(),
        player: {
            position: [12.5, 6],
            direction: EAST,
            nextDirection: EAST,
            lives: 3
        },
        monsters: [
            {
                id: 'monster-cyan',
                direction: EAST,
                live: true,
                color: 'cyan',
                position: [10.5, 15]
            },
            {
                id: 'monster-red',
                direction: NORTH,
                live: true,
                color: 'red',
                position: [12.5, 15]
            },
            {
                id: 'monster-orange',
                direction: WEST,
                live: true,
                color: 'darkorange',
                position: [14.5, 15]
            },
            {
                id: 'monster-pink',
                direction: NORTH,
                live: true,
                color: 'pink',
                position: [12.5, 17]
            }

        ],
        food: generateFood(),
        eating: false
    };
}

