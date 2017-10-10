import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchPaginationComponent from './search.pagination.component.js';
import SearchResultsItemComponent from './search.results.item.component.js';

import './css/search.results.component.css';

export default class SearchResultsComponent extends Component {
    constructor(props) {
        super();

        this.state = {
            items: props.items,
            perPage: props.perPage,
            activePage: 0,
            pages: this.splitToPages(props.items, props.perPage)
        };
    }

    componentWillReceiveProps(props) {
        this.setState(state => Object.assign({}, state, {
            items: props.items,
            pages: this.splitToPages(props.items, props.perPage)
        }));
    }

    renderItem(item) {
        item = item.value.Location;

        return <SearchResultsItemComponent 
            key={item.id} 
            data={item}
            contentTypesMap={this.props.contentTypesMap}
            onPreview={this.props.onItemSelect} />
    }

    splitToPages(items, perPage) {
        return items.reduce((pages, item, index) => {
            const pageIndex = Math.floor(index / perPage);

            if (!pages[pageIndex]) {
                pages[pageIndex] = [];
            }

            pages[pageIndex].push(item);

            return pages;
        }, []);
    }

    setActivePage(index) {
        this.setState(state => Object.assign({}, state, {activePage: index}));
    }

    render() {
        if (!this.state.pages.length) {
            return null;
        }
        
        return (
            <div className="c-search-results">
                <div className="c-search-results__title">Search results ({this.state.items.length})</div>
                <SearchPaginationComponent 
                    minIndex={0} 
                    maxIndex={this.state.pages.length - 1} 
                    activeIndex={this.state.activePage} 
                    onChange={this.setActivePage.bind(this)} />
                <div className="c-search-results__list-headers">
                    <div className="c-search-results__list-header--name">Name</div>
                    <div className="c-search-results__list-header--type">Type</div>
                    <div className="c-search-results__list-header--span"></div>
                </div>
                <div className="c-search-results__list">
                    {this.state.pages[this.state.activePage].map(this.renderItem.bind(this))}
                </div>
                <SearchPaginationComponent 
                    minIndex={0} 
                    maxIndex={this.state.pages.length - 1} 
                    activeIndex={this.state.activePage} 
                    onChange={this.setActivePage.bind(this)} />
            </div>
        );
    }
}

SearchResultsComponent.propTypes = {
    items: PropTypes.array.isRequired,
    perPage: PropTypes.number.isRequired,
    onItemSelect: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
