import { errorCode, timing } from './responsivenessTelemetry';

type SpeedWarning = { content: string; ephemeral: true };

/** Create once for each battle, sharing suppression across all of its action handlers. */
export function createBattleSpeedWarning(send: (warning: SpeedWarning) => unknown) {
    let warned = false;
    return async (): Promise<boolean> => {
        if (warned) return false;
        // Consume the first attempt before invoking the transport, including concurrent/reentrant calls.
        warned = true;
        try {
            await send({ content: "Please wait a moment, you're going too fast", ephemeral: true });
            return true;
        } catch (error) {
            // Failed sends do not reset suppression or cause repeated REST attempts in this battle.
            timing('battle_speed_warning_failed', { code: errorCode(error) });
            return false;
        }
    };
}
