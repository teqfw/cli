// @ts-check

/**
 * @namespace TeqFw_Cli_Api_Container_Configurator
 * @description Public contract for optional host-application Container configuration.
 * @interface
 */
export default class Configurator {
    /**
     * @param {TeqFw_Cli_Api_Container_Configurator_Params} params
     * @returns {TeqFw_Cli_Api_Container_Configurator_Configuration|Promise<TeqFw_Cli_Api_Container_Configurator_Configuration>}
     */
    configure(params) {
        throw new Error('TeqFw_Cli_Api_Container_Configurator is a contract and cannot configure a Container itself.');
    }
}
