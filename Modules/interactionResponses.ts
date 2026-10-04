import { MessageFlags, MessageFlagsBitField } from 'discord.js';
import type { ChatInputCommandInteraction, InteractionReplyOptions, InteractionEditReplyOptions } from 'discord.js';
import { markAcknowledged, markVisible } from './responsivenessTelemetry';

export type Acknowledgement = 'public' | 'ephemeral' | 'command';

/** Explicitly called by audited commands. Modal-owning routes retain their own acknowledgement. */
export async function deferCommand(interaction: ChatInputCommandInteraction, policy: Acknowledgement = 'public') {
    if (policy === 'command' || interaction.deferred || interaction.replied) return;
    await interaction.deferReply(policy === 'ephemeral' ? { flags: MessageFlags.Ephemeral } : {});
    markAcknowledged(interaction);
}

export async function editCommandReply(interaction: ChatInputCommandInteraction, options: string | InteractionEditReplyOptions) {
    const message = await interaction.editReply(options);
    markVisible(interaction);
    return message;
}

export async function replyToCommand(interaction: ChatInputCommandInteraction, options: string | InteractionReplyOptions) {
    const payload = typeof options === 'string' ? { content: options } : options;
    // Reply flags are a valid subset; discord.js's mutable BitField generics are invariant.
    const resolvedFlags = new MessageFlagsBitField(payload.flags as ConstructorParameters<typeof MessageFlagsBitField>[0]).bitfield;
    const privateReply = payload.ephemeral === true || (resolvedFlags & MessageFlags.Ephemeral) !== 0;
    if (!interaction.deferred && !interaction.replied) {
        const { fetchReply, withResponse, ...initial } = payload;
        const response = await interaction.reply({ ...initial, withResponse: true });
        markAcknowledged(interaction);
        markVisible(interaction);
        return response.resource?.message ?? await interaction.fetchReply();
    }
    if (interaction.deferred && !interaction.replied) {
        if (privateReply && !interaction.ephemeral) {
            // Visibility cannot change after defer. Fulfil the public acknowledgement without private data.
            await editCommandReply(interaction, { content: 'Sent you a private response.' });
            return interaction.followUp({ ...payload, flags: MessageFlags.Ephemeral });
        }
        const { ephemeral, fetchReply, withResponse, flags, ...editable } = payload;
        const editFlags = flags === undefined ? {} : { flags: resolvedFlags & (MessageFlags.SuppressEmbeds | MessageFlags.IsComponentsV2) };
        return editCommandReply(interaction, { ...editable, ...editFlags } as InteractionEditReplyOptions);
    }
    const message = await interaction.followUp(payload);
    markVisible(interaction);
    return message;
}

export async function reportCommandError(interaction: ChatInputCommandInteraction) {
    const content = 'Something went wrong while processing this command. Please try again shortly.';
    if (!interaction.deferred && !interaction.replied) {
        await replyToCommand(interaction, { content, flags: MessageFlags.Ephemeral });
    } else if (interaction.deferred && !interaction.replied) {
        // Generic text only; respect the visibility chosen by the initial defer.
        await editCommandReply(interaction, { content, embeds: [], components: [] });
    } else {
        await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    }
}
