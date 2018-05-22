import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

export default function Scores({ score, lost }) {
    let gameOver = null;

    if (lost) {
        gameOver = (
            <span className="game-over">{'Game over!'}</span>
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
    lost: PropTypes.bool.isRequired,
    score: PropTypes.number.isRequired
};

