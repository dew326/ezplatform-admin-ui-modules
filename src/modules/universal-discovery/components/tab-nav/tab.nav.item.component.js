import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './css/tab.nav.item.component.css';

export default class TabNavItemComponent extends Component {
    componentWillReceiveProps(props) {
        this.setState(state => Object.assign({}, state, {isSelected: !!props.isSelected}));
    }

    handleClick() {
        this.props.onClick(this.props.id);
    }

    render() {
        const attrs = {
            className: `c-tab-nav-item ${this.props.isSelected ? 'c-tab-nav-item--selected' : ''}`,
            onClick: this.handleClick.bind(this)
        };

        return (
            <div className="c-tab-nav-item__wrapper">
                <button {...attrs}>{this.props.title}</button>
            </div>
        );
    }
}

TabNavItemComponent.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};
