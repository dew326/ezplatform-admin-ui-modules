import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './css/search.results.item.component.css';

export default class SearchResultsItemComponent extends Component {
    handlePreviewClick() {
        this.props.onPreview(this.props.data);
    }

    render() {
        const item = this.props.data.ContentInfo.Content;
        const contentType = this.props.contentTypesMap ? this.props.contentTypesMap[item.ContentType._href] : false;
        const contentTypeName = contentType ? contentType.names.value[0]['#text'] : 'N/A';

        return (
            <div className="c-search-results-item">
                <div className="c-search-results-item__name" title={item.Name}>{item.Name}</div>
                <div className="c-search-results-item__type" title={contentTypeName}>{contentTypeName}</div>
                <div className="c-search-results-item__actions">
                    <button className="c-search-results-item__btn--preview" onClick={this.handlePreviewClick.bind(this)}>Preview</button>
                </div>
            </div>
        );
    }
}

SearchResultsItemComponent.propTypes = {
    data: PropTypes.object.isRequired,
    onPreview: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
