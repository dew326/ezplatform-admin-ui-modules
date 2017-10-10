import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './css/content.meta.preview.component.css';

export default class ContentMetaPreviewComponent extends Component {
    constructor() {
        super();

        this.state = {
            selectContentBtnActive: true,
            imageUri: null
        };
    }

    componentDidMount() {
        this.loadContentInfo(this.props.data);
    }

    componentWillReceiveProps(props) {
        if (props.data.id === this.props.data.id) {
            return;
        }

        this.setState(state => Object.assign({}, state, {imageUri: null}));
        this.loadContentInfo(props.data);
    }

    loadContentInfo(data) {
        const promise = new Promise(resolve => this.props.loadContentInfo(data.ContentInfo.Content._id, resolve));

        promise
            .then(this.setImageUri.bind(this))
            .catch(error => console.log('loadContentInfo:error', error));
    }

    setImageUri(data) {
        const imageField = data.View.Result.searchHits.searchHit[0]
            .value.Content.CurrentVersion.Version
            .Fields.field.find(field => field.fieldDefinitionIdentifier === 'image');
        
        if (!imageField) {
            return;
        }

        this.setState(state => Object.assign({}, state, {imageUri: imageField.fieldValue.uri}));
    }

    renderSelectContentBtn() {
        const attrs = {
            className: 'c-content-meta-preview__btn--select',
            onClick: this.props.onSelectContent
        };

        const canSelect = typeof this.props.canSelectContent === 'function' ?
            this.props.canSelectContent(this.props.data.ContentInfo.Content) :
            true;

        if (!this.state.selectContentBtnActive || !canSelect) {
            attrs.disabled = true;
        }

        return (
            <div className="c-content-meta-preview__btn-wrapper">
                <button {...attrs}>Select content</button>
            </div>
        );
    }

    render() {
        const data = this.props.data.ContentInfo.Content;
        const contentType = this.props.contentTypesMap ? this.props.contentTypesMap[data.ContentType._href] : false;
        const contentTypeName = contentType ? contentType.names.value[0]['#text'] : 'N/A';

        return (
            <div className="c-content-meta-preview">
                <h1 className="c-content-meta-preview__title">Selected content</h1>
                <div className="c-content-meta-preview__meta-wrapper">
                    <div className="c-content-meta-preview__content-type">{contentTypeName}</div>
                    <div className="c-content-meta-preview__image-wrapper">
                        <img className="c-content-meta-preview__image" src={this.state.imageUri} />
                    </div>
                    {this.renderSelectContentBtn()}
                    <div className="c-content-meta-preview__name">{data.Name}</div>
                    <div className="c-content-meta-preview__modified">{data.lastModificationDate}</div>
                    <div className="c-content-meta-preview__published">{data.publishedDate}</div>
                    <div className="c-content-meta-preview__language-versions">{data.mainLanguageCode}</div>
                </div>
            </div>
        );
    }
}

ContentMetaPreviewComponent.propTypes = {
    data: PropTypes.object.isRequired,
    selectContentBtnActive: PropTypes.bool,
    onSelectContent: PropTypes.func,
    canSelectContent: PropTypes.func,
    loadContentInfo: PropTypes.func.isRequired,
    contentTypesMap: PropTypes.object.isRequired
};
