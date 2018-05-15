function isBigFood([posX, posY]) {
    return (posX === 0 || posX === 25) && (posY === 7 || posY === 27);
}

function generateFood() {
    const genRow = (startX, posY, num) => new Array(num).fill(0)
        .map((item, index) => ([startX + index, posY]));

    return [
        ...genRow(0, 0, 26),
        [0, 1],
        [11, 1],
        [14, 1],
        [25, 1],
        [0, 2],
        [11, 2],
        [14, 2],
        [25, 2],
        ...genRow(0, 3, 6),
        ...genRow(8, 3, 4),
        ...genRow(14, 3, 4),
        ...genRow(20, 3, 6)
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
        player: {
            position: [12.5, 6],
            lives: 3
        },
        food: generateFood()
    };
}

