import React from 'react';
import PropTypes from 'prop-types';
import Food from '../Food';
import './style.scss';

export default function AllFood({ food, ...props }) {
    const items = food.filter(({ eaten }) => !eaten)
        .map(({ key, ...item }) => (
            <Food key={key} {...item} {...props} />
        ));

    return (
        <div className="food-all">
            {items}
        </div>
    );
}

AllFood.propTypes = {
    food: PropTypes.array.isRequired
};

