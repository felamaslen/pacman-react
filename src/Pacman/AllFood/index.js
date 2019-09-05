import React from 'react';
import PropTypes from 'prop-types';
import Food from '../Food';
import './style.scss';

export default function AllFood({ food, onFoodEnd, ...props }) {
    const items = food.filter(({ eaten }) => !eaten)
        .map(({ key, ...item }) => (
            <Food key={key} {...item} {...props} />
        ));
        console.log(items.length);
    if(items.length < 1) {
        onFoodEnd();
    }

    return (
        <div className="food-all">
            {items}
        </div>
    );
}

AllFood.propTypes = {
    food: PropTypes.array.isRequired
};

