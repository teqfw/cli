// @ts-check

/**
 * @namespace TeqFw_Cli_Api_Container_Configurator
 * @description Public contract for optional host-application Container configuration.
 * @interface
 */
export default class Configurator {
    /**
     * @param {object} params
     * @param {string} params.applicationRoot Host application directory supplied to the starter or derived from its mounted path.
     * @param {string[]} params.argv Full process argument vector, including the Node executable and teq script paths.
     * @returns {TeqFw_Cli_Api_Container_Configurator_Configuration|Promise<TeqFw_Cli_Api_Container_Configurator_Configuration>}
     */
    configure(params) {
        throw new Error('TeqFw_Cli_Api_Container_Configurator is a contract and cannot configure a Container itself.');
    }
}
