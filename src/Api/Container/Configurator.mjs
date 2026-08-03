// @ts-check

/**
 * @namespace TeqFw_Cli_Api_Container_Configurator
 * @description Public contract for optional host-application Container configuration.
 * @interface
 */
export default class Configurator {
    /**
     * @param {object} params Host application directory and full process argument vector supplied by the starter.
     * @returns {TeqFw_Cli_Api_Container_Configurator_Configuration|Promise<TeqFw_Cli_Api_Container_Configurator_Configuration>}
     */
    configure(params) {
        throw new Error('TeqFw_Cli_Api_Container_Configurator is a contract and cannot configure a Container itself.');
    }
}
