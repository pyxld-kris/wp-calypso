/**
 * External dependencies
 */
import { select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import {
	AuthOptionsSuccessResponse,
	AuthOptionsErrorResponse,
	WpLoginSuccessResponse,
	WpLoginErrorResponse,
} from './types';
import { STORE_KEY } from './constants';
import { wpcomRequest } from '../wpcom-request-controls';
import { WpcomClientCredentials } from '../shared-types';
import { fetchWpLogin } from './controls';

export function createActions( clientCreds: WpcomClientCredentials ) {
	const reset = () =>
		( {
			type: 'RESET_LOGIN_FLOW' as const,
		} as const );

	const receiveAuthOptions = ( response: AuthOptionsSuccessResponse, usernameOrEmail: string ) =>
		( {
			type: 'RECEIVE_AUTH_OPTIONS',
			response,
			usernameOrEmail,
		} as const );

	const receiveAuthOptionsFailed = ( response: AuthOptionsErrorResponse ) =>
		( {
			type: 'RECEIVE_AUTH_OPTIONS_FAILED',
			response,
		} as const );

	const clearErrors = () =>
		( {
			type: 'CLEAR_ERRORS',
		} as const );

	function* submitUsernameOrEmail( usernameOrEmail: string ) {
		yield clearErrors();
		const escaped = encodeURIComponent( usernameOrEmail );

		try {
			const authOptions = yield wpcomRequest( {
				path: `/users/${ escaped }/auth-options`,
				apiVersion: '1.1',
			} );

			yield receiveAuthOptions( authOptions, usernameOrEmail );
		} catch ( err ) {
			yield receiveAuthOptionsFailed( err );
		}
	}

	const receiveWpLogin = ( response: WpLoginSuccessResponse ) =>
		( {
			type: 'RECEIVE_WP_LOGIN',
			response,
		} as const );

	const receiveWpLoginFailed = ( response: WpLoginErrorResponse ) =>
		( {
			type: 'RECEIVE_WP_LOGIN_FAILED',
			response,
		} as const );

	function* submitPassword( password: string ) {
		yield clearErrors();
		const username = yield select( STORE_KEY, 'getUsernameOrEmail' );

		try {
			const loginResponse = yield fetchWpLogin( 'login-endpoint', {
				username,
				password,
				...clientCreds,
			} );

			if ( loginResponse.ok && loginResponse.body.success ) {
				yield receiveWpLogin( loginResponse.body );
			} else {
				yield receiveWpLoginFailed( loginResponse.body );
			}
		} catch ( e ) {
			const error = {
				code: e.name,
				message: e.message,
			};

			yield receiveWpLoginFailed( {
				success: false,
				data: { errors: [ error ] },
			} );
		}
	}

	return {
		reset,
		clearErrors,
		receiveAuthOptions,
		receiveAuthOptionsFailed,
		receiveWpLogin,
		receiveWpLoginFailed,
		submitUsernameOrEmail,
		submitPassword,
	};
}

type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'reset' ]
			| ActionCreators[ 'clearErrors' ]
			| ActionCreators[ 'receiveAuthOptions' ]
			| ActionCreators[ 'receiveAuthOptionsFailed' ]
			| ActionCreators[ 'receiveWpLogin' ]
			| ActionCreators[ 'receiveWpLoginFailed' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
