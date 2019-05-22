/**
 * Internal dependencies
 */
import nextStep from '../next-step';

describe( 'nextStep', () => {
	const steps = [ 'a', 'b', 'c' ];

	test( 'should return final step if current step is unknown', () => {
		expect( nextStep( 'unknown', steps ) ).toBe( 'c' );
	} );

	test( 'should return final step if current step is final step', () => {
		expect( nextStep( 'c', steps ) ).toBe( 'c' );
	} );

	test( 'should return next step current step is earlier step', () => {
		expect( nextStep( 'a', steps ) ).toBe( 'b' );
	} );
} );
