const HEADERS_CREATE_VIEW = {
    'Accept':'application/vnd.ez.api.View+json; version=1.1',
    'Content-Type':'application/vnd.ez.api.ViewInput+json; version=1.1'
};
const ENDPOINT_CREATE_VIEW = '/api/ezp/v2/views';
/**
 * Handles request response
 *
 * @function handleRequestResponse
 * @param {Response} response
 * @returns {String|Response}
 */
const handleRequestResponse = response => {
    if (!response.ok) {
        throw Error(response.statusText);
    }

    return response.json();
};

/**
 * Loads location struct
 *
 * @function loadLocation
 * @param {Number} locationId
 * @param {Number} limit
 * @param {Number} offset
 * @param {Function} callback
 */
export const loadLocation = (locationId = 2, limit = 10, offset = 0, callback) => {
    const body = JSON.stringify({
        ViewInput: {
            identifier: `subitems-load-location-${locationId}`,
            public: false,
            LocationQuery: {
                Criteria: {},
                FacetBuilders: {},
                SortClauses: {LocationPriority: 'ascending'},
                Filter: {ParentLocationIdCriterion: locationId},
                limit,
                offset
            }
        }
    });
    const headers = new Headers(HEADERS_CREATE_VIEW);
    const request = new Request(ENDPOINT_CREATE_VIEW, {
        method: 'POST',
        headers,
        body,
        mode: 'cors',
    });

    fetch(request)
        .then(handleRequestResponse)
        .then(callback)
        .catch(error => console.log('error:load:location', error));
};

/**
 * Loads content info
 *
 * @function loadContentInfo
 * @param {Array} contentIds
 * @param {Function} callback
 */
export const loadContentInfo = (contentIds, callback) => {
    const ids = contentIds.join();
    const body = JSON.stringify({
        ViewInput: {
            identifier: `subitems-load-content-info-${ids}`,
            public: false,
            ContentQuery: {
                Criteria: {},
                FacetBuilders: {},
                SortClauses: {},
                Filter: {ContentIdCriterion: `${ids}`},
                limit: contentIds.length,
                offset: 0
            }
        }
    });
    const headers = new Headers(HEADERS_CREATE_VIEW);
    const request = new Request(ENDPOINT_CREATE_VIEW, {
        method: 'POST',
        headers,
        body,
        mode: 'cors',
    });

    fetch(request)
        .then(handleRequestResponse)
        .then(callback)
        .catch(error => console.log('error:load:content:info', error));
};

/**
 * Loads content types
 *
 * @function loadContentTypes
 * @param {Function} callback
 */
export const loadContentTypes = (callback) => {
    const request = new Request('/api/ezp/v2/content/types', {
        method: 'GET',
        headers: {'Accept': 'application/vnd.ez.api.ContentTypeInfoList+json'},
        mode: 'cors',
    });

    fetch(request)
        .then(handleRequestResponse)
        .then(callback)
        .catch(error => console.log('error:load:content:info', error));
};

/**
 * Updates location priority
 *
 * @function updateLocationPriority
 * @param {Object} params params hash containing: priority, location, token, siteaccess properties
 * @param {Function} callback
 */
export const updateLocationPriority = ({priority, location, token, siteaccess}, callback) => {
    const request = new Request(location, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.ez.api.Location+json',
            'Content-Type': 'application/vnd.ez.api.LocationUpdate+json',
            'X-Siteaccess': siteaccess,
            'X-CSRF-Token': token,
            'X-HTTP-Method-Override': 'PATCH'
        },
        credentials: 'same-origin',
        mode: 'cors',
        body: JSON.stringify({
            LocationUpdate: {
                priority: priority,
                sortField: 'PATH',
                sortOrder: 'ASC'
            }
        })
    });

    fetch(request)
        .then(handleRequestResponse)
        .then(callback)
        .catch(error => console.log('error:update:location:priority', error));
};
