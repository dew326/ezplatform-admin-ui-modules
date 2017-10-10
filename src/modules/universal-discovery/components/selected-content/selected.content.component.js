import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SelectedContentItemComponent from './selected.content.item.component.js';
import SelectedContentPopupComponent from './selected.content.popup.component.js';

import './css/selected.content.component.css';

export default class SelectedContentComponent extends Component {
    constructor() {
        super();

        this.state = {
            items: [],
            isPopupVisible: false
        };
    }

    componentWillReceiveProps(props) {
        this.setState(state => Object.assign({}, state, {items: props.items}));
    }

    togglePopup() {
        this.setState(state => Object.assign({}, state, {isPopupVisible: !state.isPopupVisible}));
    }

    hidePopup() {
        this.setState(state => Object.assign({}, state, {isPopupVisible: false}));
    }

    renderSelectedItem(item) {
        return <SelectedContentItemComponent 
            key={item.remoteId} 
            data={item}
            onRemove={this.props.onItemRemove}
            contentTypesMap={this.props.contentTypesMap}
            />;
    }

    render() {
        const titles = this.props.items.map(item => item.ContentInfo.Content.Name).join(', ');

        return (
            <div className="c-selected-content">
                <SelectedContentPopupComponent
                    title="Confirmed items"
                    visible={this.state.isPopupVisible}
                    onClose={this.hidePopup.bind(this)}>
                    {this.props.items.map(this.renderSelectedItem.bind(this))}
                </SelectedContentPopupComponent>
                <strong className="c-selected-content__title">Confirmed items</strong>
                <div className="c-selected-content__content-names" onClick={this.togglePopup.bind(this)}>
                    ({this.props.items.length}) {titles}
                </div>
            </div>
        );
    }
}

SelectedContentComponent.propTypes = {
    items: PropTypes.array.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
