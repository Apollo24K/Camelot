import { EmbedBuilder, ComponentType } from "discord.js";
import { armorInfo, itemInfo, items, lootInfo, runeInfo, weaponInfo } from "../Modules/items";
import { PageRow, OfferRow } from "../Modules/components";
import { showPage, customEmojis, getAscensionMaterial, searchItem, getForgeMaterialCosts, resolveWildcardInput, formatWildcardLabel } from "../Modules/functions";
import { ItemRarity, SlashCommand, WeaponSchema } from "../types";
import { getUserSchema, getUserWeapons, insertNewWeapon, updateUsers, updateUsersAndCache } from "../Modules/queries";
import { mergeRecipes, MergeRecipe, WildcardInput, isValidWildcard } from "../Modules/runeMergeRecipes";
import { withTransaction } from "../postgres";

type ResolvedWildcard = { wildcard: WildcardInput; matches: WeaponSchema[]; };

function resolveAllWildcards(userWeapons: WeaponSchema[], wildcards?: WildcardInput[]): ResolvedWildcard[] {
    if (!wildcards) return [];
    return wildcards.filter(wc => {
        if (!isValidWildcard(wc)) {
            console.warn(`Invalid wildcard in recipe: no filter criteria specified (qty: ${wc.qty})`);
            return false;
        }
        return true;
    }).map(wc => ({ wildcard: wc, matches: resolveWildcardInput(userWeapons, wc) }));
};

function forgeryEmbed(elements: (itemInfo)[]) {
    const Embed = new EmbedBuilder()
        .setColor(0xbbffff)
        .setTitle("Gaius' Forgery")
        .setThumbnail("https://i.imgur.com/WbPCBqR.png")
        .setDescription("Welcome, honored one. What would you like me to do today?\n(Use `/forge craft <item>` to forge an item)\n");
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        const costs = getForgeMaterialCosts(item.id);
        const ascItem = costs.ascensionMaterialId ? items[costs.ascensionMaterialId] as lootInfo : getAscensionMaterial(item.id, ascMaterials);
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === item.grade) as lootInfo;

        if (!ascItem || !craftItem) continue;

        let statsText = "";
        if (item instanceof weaponInfo || item instanceof armorInfo) {
            statsText = `\`${item.psmin}-${item.psmax}\` ${customEmojis[item.primaryStat] || item.primaryStat}${item instanceof weaponInfo ? ` and \`${item.ssmin.endsWith("%") ? item.ssmin.slice(0, -1) : item.ssmin}-${item.ssmax}\` ${customEmojis[item.secondaryStat] || item.secondaryStat}` : ""}`;
        } else if (item instanceof runeInfo) {
            statsText = "";
        }

        Embed.addFields(
            { name: `${item.gradeEmote}`, value: `${item.bar} ${item.emoji} | ${item.name}`, inline: true },
            { name: `Cost: ${craftItem.emoji}x${costs.crafting} ${ascItem.emoji}x${costs.ascension}`, value: statsText, inline: true },
            { name: '_ _', value: '_ _', inline: true },
        );
    };
    return Embed;
};

function buildInputString(recipe: MergeRecipe, owned: Record<string, number>, resolvedWildcards: ResolvedWildcard[]): string {
    const parts: string[] = [];
    if (recipe.inputs) {
        for (const [id, qty] of Object.entries(recipe.inputs)) {
            const inp = items[parseInt(id)];
            parts.push(inp ? `${inp.emoji} **${owned[id] ?? 0}**/${qty}` : `ID ${id} **${owned[id] ?? 0}**/${qty}`);
        }
    }
    for (const rc of resolvedWildcards) {
        const label = formatWildcardLabel(rc.wildcard);
        parts.push(`**${label}** **${rc.matches.length}**/${rc.wildcard.qty}`);
    }
    const coinStr = recipe.coinCost ? ` <:coins:872926669055356939>x **${owned["coins"] ?? 0}**/${recipe.coinCost}` : "";
    return `${parts.join(" ")}${coinStr}`;
};

function canAffordRecipe(recipe: MergeRecipe, owned: Record<string, number>, resolvedWildcards: ResolvedWildcard[]): boolean {
    if (recipe.inputs) {
        for (const [id, qty] of Object.entries(recipe.inputs)) {
            if ((owned[id] ?? 0) < qty) return false;
        }
    }
    for (const rc of resolvedWildcards) {
        if (rc.matches.length < rc.wildcard.qty) return false;
    }
    if (recipe.coinCost && (owned["coins"] ?? 0) < recipe.coinCost) return false;
    return true;
};

function mergeEmbed(elements: { recipe: MergeRecipe; owned: Record<string, number>; resolvedWildcards: ResolvedWildcard[]; }[]) {
    const Embed = new EmbedBuilder()
        .setColor(0xbbffff)
        .setTitle("Item Merging")
        .setThumbnail("https://i.imgur.com/WbPCBqR.png")
        .setDescription("Combine items to create new ones.\n(Use `/forge merge <item>` to see details for a specific item)");
    for (const { recipe, owned, resolvedWildcards } of elements) {
        const outItem = items[recipe.output];
        if (!outItem) continue;
        const hasAll = canAffordRecipe(recipe, owned, resolvedWildcards);
        const inputStr = buildInputString(recipe, owned, resolvedWildcards);
        Embed.addFields(
            { name: `${outItem.gradeEmote}`, value: `${hasAll ? "" : "❌ "}${outItem.bar} ${outItem.emoji} | ${outItem.name}${recipe.label ? ` (${recipe.label})` : ""}`, inline: true },
            { name: "Inputs", value: inputStr || "None", inline: true },
            { name: '_ _', value: '_ _', inline: true },
        );
    };
    return Embed;
};

function buildConfirmationEmbed(recipe: MergeRecipe, outItem: itemInfo, owned: Record<string, number>, resolvedWildcards: ResolvedWildcard[]): { embed: EmbedBuilder; canAfford: boolean } {
    const inputLines: string[] = [];
    let hasAll = true;

    if (recipe.inputs) {
        for (const [id, qty] of Object.entries(recipe.inputs)) {
            const inp = items[parseInt(id)];
            const owned_qty = owned[id] ?? 0;
            if (owned_qty < qty) hasAll = false;
            inputLines.push(inp ? `${inp.emoji} **${inp.name}** x${owned_qty}/${qty}` : `ID ${id} x${owned_qty}/${qty}`);
        }
    }
    for (const rc of resolvedWildcards) {
        if (rc.matches.length < rc.wildcard.qty) hasAll = false;
        const label = formatWildcardLabel(rc.wildcard);
        inputLines.push(`${label} x${rc.matches.length}/${rc.wildcard.qty}`);
    }
    if (recipe.coinCost) {
        const hasCoins = owned["coins"] ?? 0;
        if (hasCoins < recipe.coinCost) hasAll = false;
        inputLines.push(`<:coins:872926669055356939>x **${hasCoins}**/${recipe.coinCost}`);
    }

    const Embed = new EmbedBuilder()
        .setTitle("Item Merging")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WbPCBqR.png")
        .setDescription(`Merge the following to create **${outItem.emoji} ${outItem.name}**?` + (hasAll ? "" : "\n\n❌ You don't have enough materials."))
        .addFields(
            { name: "Inputs", value: inputLines.join("\n") || "None", inline: true },
            { name: "Output", value: `${outItem.bar} ${outItem.emoji} | ${outItem.name}`, inline: true },
        );

    return { embed: Embed, canAfford: hasAll };
};

const ascMaterials = items.filter((e) => e.type === "ascension material");

const exportCommand: SlashCommand = {
    name: 'forge',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "catalog") {
            let grade = interaction.options.getString('grade') as Omit<ItemRarity, "genesis" | "mythical"> | null;
            let page = interaction.options.getInteger('page') || 1;

            const itemsR = items.filter((e) => e.obtain.includes("crafting") && (grade ? e.grade === grade : true));
            itemsR.sort((a, b) => a.gradeValue - b.gradeValue);

            let elementsPerPage = 7;
            let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) currPage = page;

            let showItems = showPage(currPage, itemsR, elementsPerPage);

            return interaction.reply({ embeds: [forgeryEmbed(showItems).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, itemsR, elementsPerPage);
                    interaction.editReply({ embeds: [forgeryEmbed(showItems).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] });
                });
            });
        };

        if (subcommand === "craft") {
            let item = interaction.options.getString('item', true);

            const itemsR = items.filter((e) => e.obtain.includes("crafting"));
            itemsR.sort((a, b) => a.gradeValue - b.gradeValue);

            const fItem = searchItem(item, interaction);
            if (!fItem) return;

            if (!itemsR.includes(fItem)) return interaction.reply(`You can't craft ${fItem.emoji} **__${fItem.name}__**`);

            const stats = author.schema;

            const costs = getForgeMaterialCosts(fItem.id);
            const ascItem = costs.ascensionMaterialId ? items[costs.ascensionMaterialId] as lootInfo : getAscensionMaterial(fItem.id, ascMaterials);
            const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
            if (!craftItem) return interaction.reply(`Error: Unknown crafting material`);
            if (!ascItem) return interaction.reply(`Error: Unknown ascension material`);

            if ((stats.items[ascItem.id] || 0) < costs.ascension) return interaction.reply(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${costs.ascension})`);
            if ((stats.items[craftItem.id] || 0) < costs.crafting) return interaction.reply(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${costs.crafting})`);

            const Embed = new EmbedBuilder()
                .setTitle("Gaius' Forgery")
                .setColor(0xbbffff)
                .setDescription(`Let me confirm your order:\n**1x** ${fItem.emoji} **__${fItem.name}__**\nfor ${craftItem.emoji}**x${costs.crafting}** & ${ascItem.emoji}**x${costs.ascension}**?`)
                .setThumbnail("https://i.imgur.com/WbPCBqR.png");
            return interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    try {
                        await withTransaction(async (client) => {
                            const { rows: [userRow] } = await client.query(`SELECT items FROM users WHERE id = $1 FOR UPDATE`, [interaction.user.id]);
                            if (!userRow) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Couldn't find user");
                                return;
                            };

                            const userItems = userRow.items ?? {};
                            if ((userItems[ascItem.id] || 0) < costs.ascension) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${userItems[ascItem.id] || 0}**/${costs.ascension})`);
                                throw new Error('INSUFFICIENT_ITEMS');
                            };
                            if ((userItems[craftItem.id] || 0) < costs.crafting) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${userItems[craftItem.id] || 0}**/${costs.crafting})`);
                                throw new Error('INSUFFICIENT_ITEMS');
                            };

                            const mergeValue: Record<string, number> = { [ascItem.id]: -costs.ascension, [craftItem.id]: -costs.crafting };
                            await client.query(`UPDATE users SET items = (
                                SELECT jsonb_object_agg(key,
                                    CASE
                                        WHEN items->key IS NOT NULL AND $1::jsonb->key IS NOT NULL
                                            AND jsonb_typeof(items->key) = 'number'
                                            AND jsonb_typeof($1::jsonb->key) = 'number' THEN
                                                to_jsonb(GREATEST(0, (items->key)::numeric + ($1::jsonb->key)::numeric))
                                        WHEN $1::jsonb->key IS NOT NULL THEN
                                            $1::jsonb->key
                                        ELSE
                                            items->key
                                    END
                                )
                                FROM jsonb_each(COALESCE(items, '{}'::jsonb) || $1::jsonb)
                            ) WHERE id = $2`, [mergeValue, interaction.user.id]);

                            if (fItem.category === "weapon" || fItem.category === "armor" || fItem.category === "ring") {
                                await insertNewWeapon(interaction.user.id, fItem.id, fItem.category, undefined, undefined, undefined, client);
                            } else {
                                const itemMergeValue: Record<string, number> = { [fItem.id]: 1 };
                                await client.query(`UPDATE users SET items = (
                                    SELECT jsonb_object_agg(key,
                                        CASE
                                            WHEN items->key IS NOT NULL AND $1::jsonb->key IS NOT NULL
                                                AND jsonb_typeof(items->key) = 'number'
                                                AND jsonb_typeof($1::jsonb->key) = 'number' THEN
                                                    to_jsonb(GREATEST(0, (items->key)::numeric + ($1::jsonb->key)::numeric))
                                            WHEN $1::jsonb->key IS NOT NULL THEN
                                                $1::jsonb->key
                                            ELSE
                                                items->key
                                        END
                                    )
                                    FROM jsonb_each(COALESCE(items, '{}'::jsonb) || $1::jsonb)
                                ) WHERE id = $2`, [itemMergeValue, interaction.user.id]);
                            }

                            if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully crafted ${fItem.emoji} **__${fItem.name}__**!`);
                        });
                        interaction.client.userCache.delete(interaction.user.id);
                    } catch (e) {
                        if (e instanceof Error && e.message === 'INSUFFICIENT_ITEMS') return;
                        console.error('Forge craft transaction failed:', e);
                    };
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };

        if (subcommand === "merge") {
            const itemArg = interaction.options.getString('item');
            const sacrificeArg = interaction.options.getString('sacrifice');
            const page = interaction.options.getInteger('page') || 1;

            const stats = author.schema;
            const userWeapons = await getUserWeapons(interaction.user.id);

            interface OwnedMap { [key: string]: number; };
            const owned: OwnedMap = { ...stats.items, coins: stats.coins };

            if (!itemArg) {
                if (!mergeRecipes.length) return interaction.reply("No merge recipes available.");

                let elementsPerPage = 7;
                let pagesTotal = Math.ceil(mergeRecipes.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) currPage = page;

                let showRecipes = showPage(currPage, mergeRecipes, elementsPerPage);

                const buildData = () => showRecipes.map(recipe => ({
                    recipe,
                    owned,
                    resolvedWildcards: resolveAllWildcards(userWeapons, recipe.wildcards),
                }));

                return interaction.reply({ embeds: [mergeEmbed(buildData()).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                    collector.on('collect', async r => {
                        if (r.customId === "prev") {
                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;
                        } else {
                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;
                        };

                        showRecipes = showPage(currPage, mergeRecipes, elementsPerPage);
                        interaction.editReply({ embeds: [mergeEmbed(buildData()).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] });
                    });
                });
            };

            const fItem = searchItem(itemArg, interaction);
            if (!fItem) return;

            const matchingRecipes = mergeRecipes.filter(r => r.output === fItem.id);

            if (!matchingRecipes.length) return interaction.reply(`No merge recipe produces ${fItem.emoji} **__${fItem.name}__**.`);

            if (matchingRecipes.length > 1) {
                let elementsPerPage = 7;
                let pagesTotal = Math.ceil(matchingRecipes.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) currPage = page;

                let showRecipes = showPage(currPage, matchingRecipes, elementsPerPage);
                const buildData = () => showRecipes.map(recipe => ({
                    recipe,
                    owned,
                    resolvedWildcards: resolveAllWildcards(userWeapons, recipe.wildcards),
                }));

                return interaction.reply({ embeds: [mergeEmbed(buildData()).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                    collector.on('collect', async r => {
                        if (r.customId === "prev") {
                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;
                        } else {
                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;
                        };

                        showRecipes = showPage(currPage, matchingRecipes, elementsPerPage);
                        interaction.editReply({ embeds: [mergeEmbed(buildData()).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] });
                    });
                });
            };

            const recipe = matchingRecipes[0];
            const outItem = items[recipe.output];
            if (!outItem) return interaction.reply("Invalid recipe: output item not found.");

            const resolvedWildcards = resolveAllWildcards(userWeapons, recipe.wildcards);
            const { embed: Embed, canAfford: hasAll } = buildConfirmationEmbed(recipe, outItem, owned, resolvedWildcards);

            return interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    try {
                        await withTransaction(async (client) => {
                            const { rows: [userRow] } = await client.query(`SELECT items, coins FROM users WHERE id = $1 FOR UPDATE`, [interaction.user.id]);
                            if (!userRow) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Couldn't find user");
                                return;
                            };

                            const userItems = userRow.items ?? {};

                            // Validate fixed inputs
                            if (recipe.inputs) {
                                for (const [id, qty] of Object.entries(recipe.inputs)) {
                                    if ((userItems[id] || 0) < qty) {
                                        const inp = items[parseInt(id)];
                                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${inp ? `${inp.emoji} **${inp.name}**` : `ID ${id}`}.`);
                                        throw new Error('INSUFFICIENT_ITEMS');
                                    }
                                }
                            }

                            // Re-resolve wildcards inside transaction against fresh weapon data
                            const txUserWeapons = await client.query(`SELECT * FROM weapons WHERE id = $1`, [interaction.user.id]) as { rows: WeaponSchema[] };
                            const txResolvedWildcards = resolveAllWildcards(txUserWeapons.rows, recipe.wildcards);

                            for (const rc of txResolvedWildcards) {
                                if (rc.matches.length < rc.wildcard.qty) {
                                    const label = formatWildcardLabel(rc.wildcard);
                                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${label} items (have **${rc.matches.length}**, need **${rc.wildcard.qty}**).`);
                                    throw new Error('INSUFFICIENT_ITEMS');
                                }
                            }

                            // Validate coin cost
                            if (recipe.coinCost && ((userRow.coins ?? 0) < recipe.coinCost)) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough <:coins:872926669055356939>. Need **${recipe.coinCost}**, have **${userRow.coins}**.`);
                                throw new Error('INSUFFICIENT_ITEMS');
                            }

                            // Parse user-specified sacrifice IDs
                            const sacrificeIds = sacrificeArg
                                ? sacrificeArg.split(",").map(s => s.trim()).filter(Boolean)
                                : [];

                            // Build list of weapon uniqueids to delete
                            const toDelete: string[] = [];

                            if (txResolvedWildcards.length > 0) {
                                const totalWildcardQty = txResolvedWildcards.reduce((s, rc) => s + rc.wildcard.qty, 0);

                                if (sacrificeIds.length > 0) {
                                    // User specified sacrifice items — validate each
                                    let idIndex = 0;
                                    for (const rc of txResolvedWildcards) {
                                        const matchingIds = new Set(rc.matches.map(w => w.uniqueid));

                                        for (let i = 0; i < rc.wildcard.qty; i++) {
                                            if (idIndex >= sacrificeIds.length) {
                                                if (interaction.channel?.isSendable()) interaction.channel.send(`Not enough sacrifice IDs provided. Need **${totalWildcardQty}** unique IDs for wildcard inputs.`);
                                                throw new Error('INSUFFICIENT_ITEMS');
                                            }
                                            const uid = sacrificeIds[idIndex];
                                            if (!matchingIds.has(uid)) {
                                                const label = formatWildcardLabel(rc.wildcard);
                                                if (interaction.channel?.isSendable()) interaction.channel.send(`The item \`${uid}\` is not a valid ${label} for this recipe.`);
                                                throw new Error('INSUFFICIENT_ITEMS');
                                            }
                                            toDelete.push(uid);
                                            idIndex++;
                                        }
                                    }
                                    // Check for extra IDs
                                    if (idIndex < sacrificeIds.length) {
                                        if (interaction.channel?.isSendable()) interaction.channel.send(`Too many sacrifice IDs provided. Expected **${idIndex}**, got **${sacrificeIds.length}**.`);
                                        throw new Error('INSUFFICIENT_ITEMS');
                                    }
                                } else {
                                    // Auto-select: unequipped items first
                                    const equipped = new Set(Object.values(stats.equipment).filter(Boolean));
                                    for (const rc of txResolvedWildcards) {
                                        const unequipped = rc.matches.filter(w => !equipped.has(w.uniqueid));
                                        const equippedMatches = rc.matches.filter(w => equipped.has(w.uniqueid));
                                        const sorted = [...unequipped, ...equippedMatches];
                                        for (let i = 0; i < rc.wildcard.qty; i++) {
                                            toDelete.push(sorted[i].uniqueid);
                                        }
                                    }
                                }
                            }

                            // Deduct fixed inputs from users.items
                            if (recipe.inputs) {
                                const mergeValue: Record<string, number> = {};
                                for (const [id, qty] of Object.entries(recipe.inputs)) {
                                    mergeValue[id] = -qty;
                                }
                                await client.query(`UPDATE users SET items = (
                                    SELECT jsonb_object_agg(key,
                                        CASE
                                            WHEN items->key IS NOT NULL AND $1::jsonb->key IS NOT NULL
                                                AND jsonb_typeof(items->key) = 'number'
                                                AND jsonb_typeof($1::jsonb->key) = 'number' THEN
                                                    to_jsonb(GREATEST(0, (items->key)::numeric + ($1::jsonb->key)::numeric))
                                            WHEN $1::jsonb->key IS NOT NULL THEN
                                                $1::jsonb->key
                                            ELSE
                                                items->key
                                        END
                                    )
                                    FROM jsonb_each(COALESCE(items, '{}'::jsonb) || $1::jsonb)
                                ) WHERE id = $2`, [mergeValue, interaction.user.id]);
                            }

                            // Delete sacrificed weapons/armor/rings
                            if (toDelete.length > 0) {
                                await client.query(`DELETE FROM weapons WHERE uniqueid = ANY($1)`, [toDelete]);
                            }

                            // Deduct coins
                            if (recipe.coinCost) {
                                await client.query(`UPDATE users SET coins = coins - $1 WHERE id = $2`, [recipe.coinCost, interaction.user.id]);
                            }

                            // Insert output
                            if (outItem.category === "weapon" || outItem.category === "armor" || outItem.category === "ring") {
                                await insertNewWeapon(interaction.user.id, outItem.id, outItem.category, undefined, undefined, undefined, client);
                            } else {
                                const itemMergeValue: Record<string, number> = { [outItem.id]: 1 };
                                await client.query(`UPDATE users SET items = (
                                    SELECT jsonb_object_agg(key,
                                        CASE
                                            WHEN items->key IS NOT NULL AND $1::jsonb->key IS NOT NULL
                                                AND jsonb_typeof(items->key) = 'number'
                                                AND jsonb_typeof($1::jsonb->key) = 'number' THEN
                                                    to_jsonb(GREATEST(0, (items->key)::numeric + ($1::jsonb->key)::numeric))
                                            WHEN $1::jsonb->key IS NOT NULL THEN
                                                $1::jsonb->key
                                            ELSE
                                                items->key
                                        END
                                    )
                                    FROM jsonb_each(COALESCE(items, '{}'::jsonb) || $1::jsonb)
                                ) WHERE id = $2`, [itemMergeValue, interaction.user.id]);
                            }

                            if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully merged into ${outItem.emoji} **__${outItem.name}__**!`);
                        });
                        interaction.client.userCache.delete(interaction.user.id);
                    } catch (e) {
                        if (e instanceof Error && e.message === 'INSUFFICIENT_ITEMS') return;
                        console.error('Forge merge transaction failed:', e);
                    };
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });
            });
        };
    },
};

export default exportCommand;
