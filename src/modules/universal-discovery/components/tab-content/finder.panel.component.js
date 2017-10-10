import React from 'react';
import PropTypes from 'prop-types';

import TabContentPanelComponent from './tab.content.panel.component.js';
import FinderComponent from '../finder/finder.component.js';

import './css/finder.panel.component.css';

const FinderPanelComponent = (props) => {
    const attrs = {className: 'c-finder-panel'};
    const {multiple, startingLocationId, findLocationsByParentLocationId, onItemSelect, maxHeight} = props;
    const finderAttrs = Object.assign({}, {multiple, startingLocationId, findLocationsByParentLocationId, onItemSelect, maxHeight});

    if (!props.isVisible) {
        attrs.hidden = true;
    }

    return (
        <div {...attrs}>
            <TabContentPanelComponent {...props}>
                <FinderComponent {...finderAttrs}/>
            </TabContentPanelComponent>
        </div>
    );
};

FinderPanelComponent.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    multiple: PropTypes.bool,
    startingLocationId: PropTypes.number,
    findLocationsByParentLocationId: PropTypes.func.isRequired,
    onItemSelect: PropTypes.func.isRequired,
    maxHeight: PropTypes.number
};

export default FinderPanelComponent;
