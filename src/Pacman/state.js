function isBigFood([posX, posY]) {
    return (posX === 0 || posX === 25) && (posY === 7 || posY === 27);
}

function generateFood() {
    const genRow = (posY, startX, num) => new Array(num).fill(0)
        .map((item, index) => ([startX + index, 0]));

    return [
        ...genRow(0, 0, 25),
        [0, 1],
        [12, 1],
        [15, 1],
        [25, 1],
        [0, 2],
        [12, 2],
        [15, 2],
        [25, 2],
        ...genRow(3, 0, 6),
        ...genRow(3, 8, 4),
        ...genRow(3, 14, 4),
        ...genRow(3, 20, 6)
    ]
        .map(position => ({
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

