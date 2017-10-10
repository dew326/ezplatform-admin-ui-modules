import React, { Component } from 'react';
import PropTypes from 'prop-types';

import FinderTreeBranchComponent from './finder.tree.branch.component.js';

import './css/finder.component.css';

export default class FinderComponent extends Component {
    constructor() {
        super();

        this.state = {
            locationsMap: {},
            activeLocations: {}
        };
    }

    componentDidMount() {
        this.props.findLocationsByParentLocationId(this.props.startingLocationId, this.updateLocationsData.bind(this));
    }

    updateLocationsData({parentLocationId, data}) {
        this.setState(state => {
            const activeLocations = Object.assign({}, state.activeLocations);
            const locationsMap = Object.assign({}, state.locationsMap, {[parentLocationId]: data});

            if (!Object.keys(activeLocations).length) {
                activeLocations[0] = {parent: 0, data};
            }

            return Object.assign({}, state, {activeLocations, locationsMap});
        });
    }

    componentDidUpdate() {
        this.updateBranchesContainerScroll();
    }

    updateBranchesContainerScroll() {
        if (!this._refBranchesContainer) {
            return;
        }

        this._refBranchesContainer.scrollLeft = this._refBranchesContainer.scrollWidth - this._refBranchesContainer.clientWidth;
    }

    renderBranch({parent, data}) {
        if (!data.View || !data.View.Result.count) {
            return null;
        }

        const items = data.View.Result.searchHits.searchHit;
        const activeLocations = Object.values(this.state.activeLocations);
        const selectedLocations = activeLocations.map(item => item.parent);

        return <FinderTreeBranchComponent 
            key={parent} 
            parent={parent} 
            items={items} 
            selectedLocations={selectedLocations}
            onItemClick={this.handleItemClick.bind(this)} />
    }

    handleItemClick({parent, location}) {
        const promise = new Promise((resolve) => {
            this.props.findLocationsByParentLocationId(parent, resolve);
        });
        
        promise
            .then((response) => {
                this.updateLocationsData(response);
                this.updateSelectedBranches(parent, location);
                this.props.onItemSelect(location);
            });
    }

    updateSelectedBranches(parent, location) {
        this.setState(this.updateLocations.bind(this, parent, location));
    }

    updateLocations(parent, location, state) {
        const data = state.locationsMap[location.id] || {};
        const locationDepth = parseInt(location.depth, 10);
        const activeLocations = Object
            .keys(state.activeLocations)
            .filter(key => parseInt(key, 10) < locationDepth)
            .reduce((total, depth) => {
                depth = parseInt(depth, 10);

                total[depth] = state.activeLocations[depth];

                return total;
            }, {});

        activeLocations[locationDepth] = {parent, data};

        return Object.assign({}, state, {activeLocations});
    }

    render() {
        const activeLocations = Object.values(this.state.activeLocations);

        if (!activeLocations.length) {
            return null;
        }

        return (
            <div className="c-finder" style={{maxHeight:`${this.props.maxHeight}px`}}>
                <div className="c-finder__branches" ref={(ref) => this._refBranchesContainer = ref}>
                    {activeLocations.map(this.renderBranch.bind(this))}
                </div>
            </div>
        );
    }
}

FinderComponent.propTypes = {
    multiple: PropTypes.bool,
    startingLocationId: PropTypes.number,
    findLocationsByParentLocationId: PropTypes.func.isRequired,
    onItemSelect: PropTypes.func.isRequired,
    maxHeight: PropTypes.number.isRequired
};

FinderComponent.defaultProps = {
    startingLocationId: 1
};
