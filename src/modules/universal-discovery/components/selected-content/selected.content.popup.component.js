import React from 'react';
import PropTypes from 'prop-types';

import PopupComponent from '../popup/popup.component.js';

import './css/selected.content.popup.component.css';

const SelectedContentPopupComponent = (props) => {
    return (
        <div className="c-selected-content-popup">
            <PopupComponent {...props}>
                {props.children}
            </PopupComponent>
        </div>
    );
}

SelectedContentPopupComponent.propTypes = {
    children: PropTypes.any.isRequired
};

export default SelectedContentPopupComponent;
