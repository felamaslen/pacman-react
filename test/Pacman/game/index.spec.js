import { expect } from 'chai';
import { EAST, NORTH, WEST, SOUTH } from '../../../src/Pacman/constants';
import { orderPolarityHorizontal } from '../../../src/Pacman/helpers';
import * as game from '../../../src/Pacman/game';

describe('game functions', () => {
    describe('hitWallHorizontal', () => {
        describe('eastwards', () => {
            it('should return the X position', () => {
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(EAST), 5.5, 5.9)).to.equal(5.9);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(EAST), 10.3, 11)).to.equal(11);
            });

            it('should hit the wall', () => {
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(EAST), 10.9, 11.5)).to.equal(11);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(EAST), 24.3, 25)).to.equal(25);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(EAST), 25, 25.1)).to.equal(25);
            });

            it('should wrap around', () => {
                expect(game.hitWallHorizontal([[-1, 8, true], [17, 26, true]],
                    orderPolarityHorizontal(EAST), 25.3, 26.1)).to.equal(-1);
                expect(game.hitWallHorizontal([[-1, 8, true], [17, 26, true]],
                    orderPolarityHorizontal(EAST), 25.3, 26)).to.equal(26);
            });
        });

        describe('westwards', () => {
            it('should return the X position', () => {
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(WEST), 0.5, 0)).to.equal(0);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(WEST), 14.3, 14)).to.equal(14);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(WEST), 14.3, 13.5)).to.equal(14);
            });

            it('should hit the wall', () => {
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(WEST), 0.3, -0.4)).to.equal(0);
                expect(game.hitWallHorizontal([[0, 11], [14, 25]],
                    orderPolarityHorizontal(WEST), 14.2, 13.9)).to.equal(14);
            });

            it('should wrap around', () => {
                expect(game.hitWallHorizontal([[-1, 8, true], [17, 26, true]],
                    orderPolarityHorizontal(WEST), -0.3, -1.2)).to.equal(26);
                expect(game.hitWallHorizontal([[-1, 8, true], [17, 26, true]],
                    orderPolarityHorizontal(WEST), -0.3, -1)).to.equal(-1);
            });
        });
    });
});

