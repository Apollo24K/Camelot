import type { AnySelectMenuInteraction, ButtonInteraction, Collection, MessageComponentInteraction } from 'discord.js';
import { markAcknowledged, markInteractionFailed } from './responsivenessTelemetry';

const acknowledgements = new WeakMap<MessageComponentInteraction, Promise<boolean>>();
const pendingAcknowledgements = new Map<string, Set<Promise<boolean>>>();
const updates = new Map<string, Promise<void>>();

type ComponentCollector<T> = {
    readonly ended: boolean;
    readonly collected: Collection<string, T>;
    on(event: 'collect', listener: (interaction: T) => void): unknown;
    on(event: 'end', listener: (collected: unknown, reason: string) => void): unknown;
};

/** The global listener and collectors must await the same in-flight acknowledgement. */
export function deferComponentUpdate(interaction: MessageComponentInteraction): Promise<boolean> {
    const pending = acknowledgements.get(interaction);
    if (pending) return pending;
    if (interaction.deferred || interaction.replied) return Promise.resolve(true);

    const acknowledgement = interaction.deferUpdate().then(() => {
        markAcknowledged(interaction);
        return true;
    }, error => {
        markInteractionFailed(error);
        return false;
    });
    // Keep failed results too: another listener must not retry or act on a failed click.
    acknowledgements.set(interaction, acknowledgement);
    const messageId = interaction.message.id;
    const pendingForMessage = pendingAcknowledgements.get(messageId) ?? new Set<Promise<boolean>>();
    pendingForMessage.add(acknowledgement);
    pendingAcknowledgements.set(messageId, pendingForMessage);
    void acknowledgement.then(() => {
        pendingForMessage.delete(acknowledgement);
        if (!pendingForMessage.size) pendingAcknowledgements.delete(messageId);
    });
    return acknowledgement;
}

export const deferButtonUpdate = (interaction: ButtonInteraction) => deferComponentUpdate(interaction);

/** Gate rendering, not gameplay: existing battle turn locks still run at click time. */
export async function waitForComponentAcknowledgements(messageId: string): Promise<void> {
    while (true) {
        const pending = pendingAcknowledgements.get(messageId);
        if (!pending) return;
        await Promise.all(pending);
    }
}

/** Share a queue across a message's collectors. Follow-ups can use their owning menu's ID. */
export function collectComponentUpdates<T extends ButtonInteraction | AnySelectMenuInteraction>(
    collector: ComponentCollector<T>,
    update: (interaction: T) => Promise<unknown>,
    queueMessageId?: string,
): void {
    let stoppedAtLimit = false;
    collector.on('end', (_collected, reason) => {
        stoppedAtLimit = ['limit', 'componentLimit', 'userLimit'].includes(reason);
    });
    collector.on('collect', interaction => {
        if (collector.ended) return;
        // These routes must send their own initial reply or open a modal immediately.
        if (interaction.customId.startsWith('ignore_defer')) {
            void update(interaction).catch(markInteractionFailed);
            return;
        }
        const acknowledged = deferComponentUpdate(interaction);
        const messageId = queueMessageId ?? interaction.message.id;
        const pending = (updates.get(messageId) ?? Promise.resolve()).then(async () => {
            // max: 1 collectors end immediately after emitting their accepted click.
            if (!await acknowledged || (collector.ended && !stoppedAtLimit)) return;
            await waitForComponentAcknowledgements(messageId);
            if (collector.ended && !stoppedAtLimit) return;
            await update(interaction);
        }).catch(markInteractionFailed);
        updates.set(messageId, pending);
        void pending.then(() => {
            if (updates.get(messageId) === pending) updates.delete(messageId);
        });
    });
}

export const collectButtonUpdates = collectComponentUpdates<ButtonInteraction>;
