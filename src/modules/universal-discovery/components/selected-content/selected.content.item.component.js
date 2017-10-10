import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './css/selected.content.item.component.css';

export default class SelectedContentItemComponent extends Component {
    remove() {
        this.props.onRemove(this.props.data.id);
    }

    render() {
        const {data, contentTypesMap} = this.props;
        const contentType = contentTypesMap ? contentTypesMap[data.ContentInfo.Content.ContentType._href] : false;
        const contentTypeName = contentType ? contentType.names.value[0]['#text'] : 'N/A';

        return (
            <div className="c-selected-content-item">
                <div className="c-selected-content-item__remove" onClick={this.remove.bind(this)}>X</div>
                <div className="c-selected-content-item__wrapper">
                    <div className="c-selected-content-item__name">{data.ContentInfo.Content.Name}</div>
                    <div className="c-selected-content-item__type">{contentTypeName}</div>
                </div>
            </div>
        );
    }
}

SelectedContentItemComponent.propTypes = {
    data: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
