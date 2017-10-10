import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchResultsComponent from './search.results.component.js';

import './css/search.component.css';

export default class SearchComponent extends Component {
    constructor() {
        super();

        this.state = {
            items: []
        }
    }

    handleClick() {
        const promise = new Promise(resolve => this.props.findContentBySearchQuery(this._refSearchInput.value, resolve));

        promise
            .then(this.setItems.bind(this))
            .catch(error => console.log('search:component:handleClick', error));
    }

    setItems(response) {
        this.setState(state => Object.assign({}, state, {items: response.View.Result.searchHits.searchHit}));
    }

    render() {
        return (
            <div className="c-search" style={{maxHeight:`${this.props.maxHeight}px`}}>
                <div className="c-search__title">{this.props.title || 'Search'}</div>
                <div className="c-search__form">
                    <input className="c-search__input" type="text" ref={(ref) => this._refSearchInput = ref} />
                    <button className="c-search__submit" onClick={this.handleClick.bind(this)}>Search</button>
                </div>
                <div className="c-search__results">
                    <SearchResultsComponent items={this.state.items} onItemSelect={this.props.onItemSelect} perPage={5} contentTypesMap={this.props.contentTypesMap}/>
                </div>
            </div>
        );
    }
}

SearchComponent.propTypes = {
    title: PropTypes.string,
    multiple: PropTypes.bool,
    findContentBySearchQuery: PropTypes.func.isRequired,
    onItemSelect: PropTypes.func.isRequired,
    maxHeight: PropTypes.number.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
