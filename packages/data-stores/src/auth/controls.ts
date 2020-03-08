/**
 * External dependencies
 */
import { stringify } from 'qs';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { FetchWpLoginAction } from './actions';
import { WpcomClientCredentials } from '../shared-types';
import { createControls as createCommonControls } from '../wpcom-request-controls';

export function createControls( clientCreds: WpcomClientCredentials ) {
	requestAllBlogsAccess().catch( () => {
		throw new Error( 'Could not get all blog access.' );
	} );

	return {
		...createCommonControls( clientCreds ),
		FETCH_WP_LOGIN: async ( { action, params }: FetchWpLoginAction ) => {
			const response = await fetch(
				// TODO Wrap this in `localizeUrl` from lib/i18n-utils
				'https://wordpress.com/wp-login.php?action=' + encodeURIComponent( action ),
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded',
					},
					body: stringify( {
						remember_me: true,
						...clientCreds,
						...params,
					} ),
				}
			);

			return {
				ok: response.ok,
				body: await response.json(),
			};
		},
	};
}
