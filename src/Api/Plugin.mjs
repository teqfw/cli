// @ts-check

/**
 * @namespace TeqFw_Cli_Api_Plugin
 * @description Public contract for an optional CLI plugin component.
 * @interface
 */
export default class Plugin {
    /** @returns {void|Promise<void>} */
    onStartup() {
        throw new Error('TeqFw_Cli_Api_Plugin is a contract and cannot start a plugin itself.');
    }

    /** @returns {void|Promise<void>} */
    onShutdown() {
        throw new Error('TeqFw_Cli_Api_Plugin is a contract and cannot shut down a plugin itself.');
    }
}
