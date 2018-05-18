import { expect } from 'chai';
import * as game from '../../../src/Pacman/game';

describe('game functions', () => {
    describe('hitWallEast', () => {
        it('should return the X position', () => {
            expect(game.hitWallEast([[0, 11], [14, 25]], 5.5, 5.9)).to.equal(5.9);
            expect(game.hitWallEast([[0, 11], [14, 25]], 10.3, 11)).to.equal(11);
        });

        it('should hit the wall', () => {
            expect(game.hitWallEast([[0, 11], [14, 25]], 10.9, 11.5)).to.equal(11);
            expect(game.hitWallEast([[0, 11], [14, 25]], 24.3, 25)).to.equal(25);
            expect(game.hitWallEast([[0, 11], [14, 25]], 25, 25.1)).to.equal(25);
        });

        it('should wrap around', () => {
            expect(game.hitWallEast([[-1, 8, true], [17, 26, true]], 25.3, 26.1)).to.equal(-1);
            expect(game.hitWallEast([[-1, 8, true], [17, 26, true]], 25.3, 26)).to.equal(26);
        });
    });

    describe('hitWallWest', () => {
        it('should return the X position', () => {
            expect(game.hitWallWest([[0, 11], [14, 25]], 0.5, 0)).to.equal(0);
            expect(game.hitWallWest([[0, 11], [14, 25]], 14.3, 14)).to.equal(14);
            expect(game.hitWallWest([[0, 11], [14, 25]], 14.3, 13.5)).to.equal(14);
        });

        it('should hit the wall', () => {
            expect(game.hitWallWest([[0, 11], [14, 25]], 0.3, -0.4)).to.equal(0);
            expect(game.hitWallWest([[0, 11], [14, 25]], 14.2, 13.9)).to.equal(14);
        });

        it('should wrap around', () => {
            expect(game.hitWallWest([[-1, 8, true], [17, 26, true]], -0.3, -1.2)).to.equal(26);
            expect(game.hitWallWest([[-1, 8, true], [17, 26, true]], -0.3, -1)).to.equal(-1);
        });
    });
});

