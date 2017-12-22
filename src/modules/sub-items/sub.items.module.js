import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ViewSwitcherComponent from './components/view-switcher/view.switcher.component.js';
import SubItemsListComponent from './components/sub-items-list/sub.items.list.component.js';
import LoadMoreComponent from './components/load-more/load.more.component.js';

import {
    updateLocationPriority,
    loadLocation,
    loadContentInfo,
    loadContentType,
    loadContentTypes
} from './services/sub.items.service';

import './css/sub.items.module.css';

export default class SubItemsModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeView: props.activeView,
            items: props.items,
            contentTypesMap: props.contentTypesMap,
            totalCount: props.totalCount,
            limit: props.limit,
            offset: props.offset,
            isLoading: !props.items.length
        };
    }

    componentDidMount() {
        if (this.state.items.length) {
            return;
        }

        this.loadItems();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.offset < this.state.offset) {
            this.loadItems();
        }
    }

    componentWillReceiveProps(props) {
        this.setState(state => Object.assign({}, state, {items: [...state.items, ...props.items]}));
    }

    /**
     * Increases an amount of items to be loaded in the list
     *
     * @method handleLoadMore
     * @memberof SubItemsModule
     */
    handleLoadMore() {
        this.setState(state => Object.assign({}, state, {offset: (state.offset + state.limit)}));
    }

    /**
     * Loads items into the list
     *
     * @method loadItems
     * @memberof SubItemsModule
     */
    loadItems() {
        const parentLocationId = this.props.parentLocationId;

        this.setState(state => Object.assign({}, state, {isLoading: true}));

        this.loadLocation(parentLocationId)
            .then(this.loadContentItems.bind(this))
            .then(this.loadContentTypes.bind(this))
            .then(this.updateItemsState.bind(this))
            .catch(error => console.log('sub:items:load:items:error', error));
    }

    /**
     * Loads location data
     *
     * @method loadLocation
     * @param {Number} locationId
     * @returns {Promise}
     * @memberof SubItemsModule
     */
    loadLocation(locationId) {
        const queryConfig = {
            locationId,
            limit: this.state.limit,
            offset: this.state.offset,
            sortClauses: this.props.sortClauses,
        }

        return new Promise((resolve) => this.props.loadLocation(this.props.restInfo, queryConfig, resolve));
    }

    /**
     * Loads content items from location
     *
     * @method loadContentItems
     * @param {Object} response query results
     * @returns {Promise}
     * @memberof SubItemsModule
     */
    loadContentItems(response) {
        if (!response || !response.View) {
            throw new Error(this.props.labels.subItems.invalidResponseFormat);
        }

        const locations = response.View.Result.searchHits.searchHit;
        const promises = [];

        promises.push(new Promise((resolve) => {
            const contentIds = locations.map(item => item.value.Location.ContentInfo.Content._id);

            this.props.loadContentInfo(this.props.restInfo, contentIds, resolve);
        }).then(contentInfo => ({
            locations,
            totalCount: response.View.Result.count,
            content: contentInfo.View.Result.searchHits.searchHit
        })));

        return Promise.all(promises);
    }

    /**
     * Loads content types info
     *
     * @method loadContenTypes
     * @param {Array} responses
     * @returns {Promise}
     * @memberof SubItemsModule
     */
    loadContentTypes(responses) {
        const promises = responses[0].content.reduce((total, item) => {
            return [...total, new Promise(resolve => {
                const contentTypeId = item.value.Content.ContentType._href;

                if (!this.state.contentTypesMap[contentTypeId]) {
                    this.props.loadContentType(
                        contentTypeId,
                        this.props.restInfo,
                        response => resolve(response)
                    );
                } else {
                    resolve({ContentType: this.state.contentTypesMap[contentTypeId]})
                }
            })];
        }, []);

        return Promise.all(promises).then(contentTypes => {
            responses[0].contentTypes = contentTypes;

            return responses[0];
        });
    }

    /**
     * Updates module state by updating items list
     *
     * @method updateItemsState
     * @param {Array} responses
     * @memberof SubItemsModule
     */
    updateItemsState({locations, content, totalCount, contentTypes}) {
        const items = locations.reduce((total, location) => {
            const itemLocation = location.value.Location;

            return [...total, {
                location: itemLocation,
                content: content.find(item => item.value.Content._id === itemLocation.ContentInfo.Content._id).value.Content
            }];
        }, []);

        this.setState(state => Object.assign({}, state, {
            items: [...state.items, ...items],
            isLoading: false,
            totalCount,
            contentTypesMap: this.buildContentTypesMap(contentTypes)
        }));
    }

    /**
     * Builds content types map
     *
     * @method buildContentTypesMap
     * @param {Array} contentTypes
     * @returns {Object}
     * @memberof SubItemsModule
     */
    buildContentTypesMap(contentTypes) {
        if (!contentTypes) {
            return {};
        }

        return contentTypes.reduce((total, item) => {
            total[item.ContentType._href] = item.ContentType;

            return total;
        }, {});
    }

    /**
     * Updates item priority
     *
     * @method handleItemPriorityUpdate
     * @param {Object} data data hash containing: priority, location, token, siteaccess
     * @memberof SubItemsModule
     */
    handleItemPriorityUpdate(data) {
        this.props.updateLocationPriority(Object.assign({}, data, this.props.restInfo), this.afterPriorityUpdated.bind(this));
    }

    /**
     * Updates module state after item's priority has been updated
     *
     * @method afterPriorityUpdated
     * @param {Object} response
     * @memberof SubItemsModule
     */
    afterPriorityUpdated(response) {
        this.setState(this.updateItemsOrder.bind(this, response.Location));
    }

    /**
     * Updates items order
     *
     * @method updateItemsOrder
     * @param {Object} location
     * @param {Object} state
     * @returns {Object}
     * @memberof SubItemsModule
     */
    updateItemsOrder(location, state) {
        const items = state.items;
        const item = items.find(element => element.location.id === location.id);

        item.location = location;

        items.sort((a, b) => a.location.priority - b.location.priority);

        return Object.assign({}, state, {items});
    }

    /**
     * Switches active view
     *
     * @method switchView
     * @param {String} activeView
     * @memberof SubItemsModule
     */
    switchView(activeView) {
        this.setState(state => Object.assign({}, state, {activeView}));
    }

    /**
     * Renders extra actions
     *
     * @method renderExtraActions
     * @param {Object} action
     * @returns {Element}
     * @memberof SubItemsModule
     */
    renderExtraActions(action) {
        const Action = action.component;

        return <Action className="m-sub-items__action" {...action.attrs} />;
    }

    /**
     * Renders load more button
     *
     * @method renderLoadMore
     * @returns {Element}
     * @memberof SubItemsModule
     */
    renderLoadMore() {
        if (!this.state.totalCount) {
            return;
        }

        return <LoadMoreComponent
            totalCount={this.state.totalCount}
            loadedCount={this.state.items.length}
            limit={this.state.limit}
            labels={this.props.labels.loadMore}
            onLoadMore={this.handleLoadMore.bind(this)} />;
    }

    render() {
        let listClassName = 'm-sub-items__list';

        if (this.state.isLoading) {
            listClassName = `${listClassName} ${listClassName}--loading`;
        }

        return (
            <div className="m-sub-items">
                <div className="m-sub-items__header">
                    <div className="m-sub-items__title">{this.props.labels.subItems.listTitle} ({this.state.items.length})</div>
                    <div className="m-sub-items__actions">{this.props.extraActions.map(this.renderExtraActions)}</div>
                    <ViewSwitcherComponent
                        onViewChange={this.switchView.bind(this)}
                        activeView={this.state.activeView}
                        isDisabled={!this.state.items.length} />
                </div>
                <div className={listClassName}>
                    <SubItemsListComponent
                        activeView={this.state.activeView}
                        contentTypesMap={this.state.contentTypesMap}
                        handleItemPriorityUpdate={this.handleItemPriorityUpdate.bind(this)}
                        items={this.state.items}
                        labels={this.props.labels}
                        handleEditItem={this.props.handleEditItem}
                        generateLink={this.props.generateLink} />
                </div>
                {this.renderLoadMore()}
            </div>
        );
    }
}

SubItemsModule.propTypes = {
    parentLocationId: PropTypes.number.isRequired,
    restInfo: PropTypes.shape({
        token: PropTypes.string.isRequired,
        siteaccess: PropTypes.string.isRequired
    }).isRequired,
    loadContentInfo: PropTypes.func,
    loadContentType: PropTypes.func,
    loadContentTypes: PropTypes.func,
    loadLocation: PropTypes.func,
    sortClauses: PropTypes.object,
    updateLocationPriority: PropTypes.func,
    activeView: PropTypes.string,
    extraActions: PropTypes.arrayOf(PropTypes.shape({
        component: PropTypes.element,
        attrs: PropTypes.object
    })),
    items: PropTypes.arrayOf(PropTypes.object),
    limit: PropTypes.number,
    offset: PropTypes.number,
    labels: PropTypes.shape({
        subItems: PropTypes.shape({
            listTitle: PropTypes.string.isRequired,
            invalidResponseFormat: PropTypes.string.isRequired
        }),
        tableView: PropTypes.object.isRequired,
        tableViewItem: PropTypes.object.isRequired,
        loadMore: PropTypes.object.isRequired,
        gridViewItem: PropTypes.object.isRequired,
        noItems: PropTypes.object.isRequired
    }),
    handleEditItem: PropTypes.func.isRequired,
    generateLink: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object,
    totalCount: PropTypes.number
};

SubItemsModule.defaultProps = {
    loadContentInfo,
    loadContentType,
    loadContentTypes,
    loadLocation,
    sortClauses: {},
    updateLocationPriority,
    activeView: 'table',
    extraActions: [],
    items: [],
    labels: {
        subItems: {
            listTitle: 'Sub-items',
            invalidResponseFormat: 'Invalid response format'
        },
        tableView: {
            headerName: 'Name',
            headerModified: 'Modified',
            headerContentType: 'Content type',
            headerPriority: 'Priority',
            headerTranslations: 'Translations'
        },
        tableViewItem: {
            edit: 'Edit',
            notAvailable: 'N/A'
        },
        loadMore: {
            info: 'Viewing <strong>{{loaded}}</strong> out of <strong>{{total}}</strong> sub-items',
            action: 'Show {{limit}} more results'
        },
        gridViewItem: {
            noImage: 'No image'
        },
        noItems: {
            message: 'This location has no sub-items'
        }
    },
    limit: 10,
    offset: 0,
    contentTypesMap: {},
    totalCount: 0
};
