/**
 * External dependencies
 */
import { registerStore } from '@wordpress/data';
import { controls as dataControls } from '@wordpress/data-controls';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { createActions } from './actions';
import { controls } from './controls';
import * as selectors from './selectors';
import { DispatchFromMap, SelectFromMap } from '../mapped-types';
import { WpcomClientCredentials } from '../shared-types';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';

export * from './types';
export { State };

let isRegistered = false;
export function register( clientCreds: WpcomClientCredentials ): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;

		requestAllBlogsAccess().catch( () => {
			throw new Error( 'Could not get all blog access.' );
		} );

		registerStore< State >( STORE_KEY, {
			actions: createActions( clientCreds ),
			controls: {
				...controls,
				...wpcomRequestControls,
				...dataControls,
			} as any,
			reducer,
			selectors,
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< ReturnType< typeof createActions > >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
