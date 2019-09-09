import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

export default function Scores({ score, ended }) {
    let gameOver = null;

    switch(ended) {
        case 'WON': {
            gameOver = (
                <span className="game-over">{'Congratulations, you won!'}</span>
            );
            break;
        }
        case 'LOST': {
            gameOver = (
                <span className="game-over">{'Game over!'}</span>
            );
            break;
        }
        default:
            break;
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

