import React from 'react';
import PropTypes from 'prop-types';

import TabContentPanelComponent from './tab.content.panel.component.js';
import SearchComponent from '../search/search.component.js';

import './css/search.panel.component.css';

const SearchPanelComponent = (props) => {
    const attrs = {className: 'c-search-panel'};
    const {multiple, findContentBySearchQuery, onItemSelect, maxHeight, contentTypesMap} = props;
    const searchAttrs = Object.assign({}, {multiple, findContentBySearchQuery, onItemSelect, maxHeight, contentTypesMap});

    if (!props.isVisible) {
        attrs.hidden = true;
    }

    return (
        <div {...attrs}>
            <TabContentPanelComponent {...props}>
                <SearchComponent {...searchAttrs} />
            </TabContentPanelComponent>
        </div>
    );
};

SearchPanelComponent.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    multiple: PropTypes.bool,
    onItemSelect: PropTypes.func.isRequired,
    findContentBySearchQuery: PropTypes.func.isRequired,
    maxHeight: PropTypes.number,
    contentTypesMap: PropTypes.object.isRequired
};

export default SearchPanelComponent;
