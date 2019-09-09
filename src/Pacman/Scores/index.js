import React from 'react';
import PropTypes from 'prop-types';
import { WON } from '../constants';
import './style.scss';

export default function Scores({ score, ended }) {
    let gameOver = null;

    if (ended) {
        gameOver = (
            <span className="game-over">
                {ended === WON ? 'Congratulations, you won!' : 'Game over'}
            </span>
        );
    }

    return (
        <div className="pacman-scores">
            <span className="running-score">
                {'Score: '}{score}
            </span>
            {gameOver}
        </div>
    );
}

Scores.propTypes = {
    ended: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired
};

