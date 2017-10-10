import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './css/popup.component.css';

export default class PopupComponent extends Component {
    constructor(props) {
        super();

        this.state = {
            items: [],
            visible: !!props.visible
        };
    }

    componentWillReceiveProps(props) {
        this.setState(state => Object.assign({}, state, {visible: props.visible}));
    }

    hidePopup() {
        this.props.onClose();
    }

    render() {
        const attrs = {
            className: 'c-popup',
            hidden: !this.state.visible
        };

        return (
            <div {...attrs}>
                <h3 className="c-popup__title">{this.props.title}</h3>
                <div className="c-popup__content">
                    {this.props.children}
                </div>
                <button className="c-popup__close" onClick={this.hidePopup.bind(this)}>X</button>
            </div>
        );
    }
}

PopupComponent.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.any,
    visible: PropTypes.bool,
    onClose: PropTypes.func
};
