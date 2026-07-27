// @ts-check
/**
 * @namespace TeqFw_Cli_Registry_Lifecycle
 * @description Validates ordered lifecycle participants returned by explicit providers.
 */
export default class LifecycleRegistry {
    /** Creates the lifecycle product validator. */
    constructor() {
        /**
         * @param {ReadonlyArray<unknown>} providers provider products in declared order
         * @returns {ReadonlyArray<TeqFw_Cli_Api_Lifecycle_Participant>} validated participants
         */
        this.build = function (providers) {
            const result = []; const ids = new Set();
            for (const provider of providers) {
                if (!provider || (typeof provider.getLifecycleParticipants !== 'function')) throw new TypeError('Lifecycle provider must expose getLifecycleParticipants().');
                const participants = provider.getLifecycleParticipants();
                if (!Array.isArray(participants)) throw new TypeError('Lifecycle provider must return an array.');
                for (const participant of participants) {
                    if (!participant || (typeof participant !== 'object') || (typeof participant.id !== 'string') || participant.id.length === 0) throw new TypeError('Lifecycle participant must have a non-empty id.');
                    if (!['initialize', 'activate', 'deactivate', 'dispose'].some((hook) => typeof participant[hook] === 'function')) throw new TypeError(`Lifecycle participant '${participant.id}' has no lifecycle hook.`);
                    if (ids.has(participant.id)) throw new Error(`Duplicate lifecycle participant id: '${participant.id}'.`);
                    ids.add(participant.id); result.push(participant);
                }
            }
            return Object.freeze(result);
        };
    }
}
