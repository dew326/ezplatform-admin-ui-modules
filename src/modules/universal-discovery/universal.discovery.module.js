import React, { Component } from 'react';
import PropTypes from 'prop-types';

import TabNavItemComponent from './components/tab-nav/tab.nav.item.component.js';
import FinderPanelComponent from './components/tab-content/finder.panel.component.js';
import SearchPanelComponent from './components/tab-content/search.panel.component.js';
import SelectedContentComponent from './components/selected-content/selected.content.component.js';
import ContentMetaPreviewComponent from './components/content-meta-preview/content.meta.preview.component.js';
import {
    loadContentInfo,
    loadContentTypes,
    findLocationsByParentLocationId,
    findContentBySearchQuery
} from './services/universal.discovery.service';

import './css/universal.discovery.module.css';

export default class UniversalDiscoveryModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: props.activeTab,
            contentMeta: null,
            contentTypesMap: {},
            selectedContent: [],
            maxHeight: 500
        };
    }

    handleConfirm() {
        this.props.contentDiscoverHandler(this.state.selectedContent);
    }

    onItemRemove(id) {
        this.setState(state => Object.assign({}, state, {
            selectedContent: state.selectedContent.filter(item => item.id !== id)
        }));
    }

    onItemSelect(contentMeta) {
        this.setState(state => Object.assign({}, state, {contentMeta}));
    }

    updateSelectedContent() {
        const selectedContent = !this.props.multiple ?
            [this.state.contentMeta] :
            [...this.state.selectedContent, this.state.contentMeta];

        this.setState(state => Object.assign({}, state, {selectedContent}));
    }

    canSelectContent(content) {
        const isAlreadySelected = this.state.selectedContent.find(item => item.ContentInfo.Content._id === content._id);

        if (isAlreadySelected) {
            return false;
        }

        if (typeof this.props.canSelectContent === 'function') {
            return this.props.canSelectContent(content);
        }

        return true;
    }

    renderContentMetaPreview() {
        if (!this.state.contentMeta) {
            return;
        }

        return (
            <div className="m-ud__preview">
                <ContentMetaPreviewComponent
                    data={this.state.contentMeta}
                    canSelectContent={this.canSelectContent.bind(this)}
                    onSelectContent={this.updateSelectedContent.bind(this)}
                    loadContentInfo={this.props.loadContentInfo}
                    contentTypesMap={this.state.contentTypesMap} />
            </div>
        );
    }

    renderSelectedContent() {
        const items = this.state.selectedContent;

        if (!items.length) {
            return;
        }

        return (
            <div className="m-ud__selected-content">
                <SelectedContentComponent
                    items={items}
                    onItemRemove={this.onItemRemove.bind(this)}
                    contentTypesMap={this.state.contentTypesMap} />
            </div>
        );
    }

    togglePanel(identifier) {
        this.setState(state => Object.assign({}, state, {
            activeTab: identifier,
            contentMeta: null
        }));
    }

    renderTabs() {
        const isBrowseVisible = this.state.activeTab === 'browse';
        const isSearchVisible = this.state.activeTab === 'search';

        return (
            <nav className="m-ud__nav">
                <TabNavItemComponent onClick={this.togglePanel.bind(this)} id="browse" title="Browse" isSelected={isBrowseVisible} />
                <TabNavItemComponent onClick={this.togglePanel.bind(this)} id="search" title="Search" isSelected={isSearchVisible} />
                {this.props.extraTabs && this.props.extraTabs.map(this.renderSingleTab.bind(this))}
            </nav>
        );
    }

    renderSingleTab(tab) {
        const attrs = {
            id: tab.id,
            title: tab.title,
            onClick: this.togglePanel.bind(this),
            isSelected: this.state.activeTab === tab.id
        };

        return <TabNavItemComponent key={`panel-${tab.id}`} {...attrs}/>;
    }

    renderPanels() {
        const browsePanelConfig = {
            id: 'browse',
            panel: FinderPanelComponent
        };
        const searchPanelConfig = {
            id: 'search',
            panel: SearchPanelComponent
        };

        return (
            <div className="m-ud__panels">
                {this.renderSinglePanel(browsePanelConfig)}
                {this.renderSinglePanel(searchPanelConfig)}
                {this.props.extraTabs && this.props.extraTabs.map(this.renderSinglePanel.bind(this))}
            </div>
        );
    }

    renderSinglePanel(item) {
        const {
            startingLocationId,
            findLocationsByParentLocationId,
            findContentBySearchQuery,
            multiple
        } = this.props;
        const attrs = Object.assign({}, {
            isVisible: this.state.activeTab === item.id,
            onItemSelect: this.onItemSelect.bind(this),
            maxHeight: this.state.maxHeight - 32,
            startingLocationId,
            findLocationsByParentLocationId,
            findContentBySearchQuery,
            id: item.id,
            contentTypesMap: this.state.contentTypesMap,
            multiple
        }, item.attrs);
        const Element = item.panel;

        return <Element key={`panel-${item.id}`} {...attrs} />;
    }

    renderConfirmBtn() {
        const attrs = {
            className: 'm-ud__action--confirm',
            onClick: this.handleConfirm.bind(this)
        };

        if (!this.state.selectedContent.length) {
            attrs.disabled = true;
        }

        return <button {...attrs}>{this.props.confirmLabel}</button>
    }

    componentDidMount() {
        this.props.loadContentTypes(this.setContentTypesMap.bind(this));

        if (!this._refContentContainer) {
            return null;
        }

        this.setState(state => Object.assign({}, state, {maxHeight: this._refContentContainer.clientHeight}));
    }

    setContentTypesMap(response) {
        if (!response || !response.ContentTypeInfoList) {
            return;
        }

        const contentTypesMap = response.ContentTypeInfoList.ContentType.reduce((total, item) => {
            total[item._href] = item;

            return total;
        }, {});

        return this.setState(state => Object.assign({}, state, {contentTypesMap}));
    }

    render() {
        const componentClassName = 'm-ud';
        const metaPreviewClassName = (!!this.state.contentMeta) ? `${componentClassName}--with-preview` : '';
        const selectedContentClassName = this.state.selectedContent.length ? `${componentClassName}--with-selected-content` : '';
        const containerClassName = `${componentClassName} ${selectedContentClassName} ${metaPreviewClassName}`;

        return (
            <div className="m-ud__wrapper">
                <div className={containerClassName}>
                    <h1 className="m-ud__title">{this.props.title}</h1>
                    {this.renderTabs()}
                    <div className="m-ud__content" ref={ref => this._refContentContainer = ref}>
                        {this.renderPanels()}
                        {this.renderContentMetaPreview()}
                    </div>
                    <div className="m-ud__actions">
                        {this.renderSelectedContent()}
                        <div className="m-ud__btns">
                            <button className="m-ud__action--cancel" onClick={this.props.cancelDiscoverHandler}>Cancel</button>
                            {this.renderConfirmBtn()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

UniversalDiscoveryModule.propTypes = {
    title: PropTypes.string.isRequired,
    multiple: PropTypes.bool,
    activeTab: PropTypes.string,
    confirmLabel: PropTypes.string,
    loadContentInfo: PropTypes.func.isRequired,
    loadContentTypes: PropTypes.func.isRequired,
    canSelectContent: PropTypes.func,
    startingLocationId: PropTypes.number,
    cancelDiscoverHandler: PropTypes.func.isRequired,
    contentDiscoverHandler: PropTypes.func.isRequired,
    findContentBySearchQuery: PropTypes.func.isRequired,
    findLocationsByParentLocationId: PropTypes.func.isRequired,
    extraTabs: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        panel: PropTypes.func.isRequired,
        attrs: PropTypes.object
    })),
};

UniversalDiscoveryModule.defaultProps = {
    title: 'Find content',
    multiple: true,
    activeTab: 'browse',
    confirmLabel: 'Confirm',
    loadContentInfo,
    loadContentTypes,
    findContentBySearchQuery,
    findLocationsByParentLocationId,
};
