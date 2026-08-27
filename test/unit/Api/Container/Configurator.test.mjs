import assert from 'node:assert/strict';
import test from 'node:test';

test('accepts a two-argument configurator preprocessor', () => {
    /** @type {TeqFw_Cli_Api_Container_Configurator_Configuration} */
    const configuration = {
        preprocessors: [
            /**
             * @param {TeqFw_Di_Dto_DepId} depId
             * @param {TeqFw_Di_Container_ResolutionContext} context
             * @returns {TeqFw_Di_Dto_DepId}
             */
            function preprocessor(depId, context) {
                assert.equal(context.depId, depId);
                return depId;
            },
        ],
    };

    assert.equal(configuration.preprocessors?.[0]?.length, 2);
});
