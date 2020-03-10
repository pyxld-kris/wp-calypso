/**
 * External dependencies
 */
import { stringify } from 'qs';

type WpLoginAction = 'login-endpoint' | 'two-step-authentication-endpoint';

export const fetchWpLogin = ( action: WpLoginAction, params: object ) =>
	( {
		type: 'FETCH_WP_LOGIN',
		action,
		params,
	} as const );

export const controls = {
	FETCH_WP_LOGIN: async ( { action, params }: ReturnType< typeof fetchWpLogin > ) => {
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
