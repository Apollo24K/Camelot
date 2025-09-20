import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction, SelectMenuComponentOptionData } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { armorInfo, itemInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { skills } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, searchClass, classLevelToXP, getRingSlotsTotal, searchItem } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand, UpdateUserOptions } from '../types';
import { getPartyMembers, getWeaponSchemas, updateUsers } from '../Modules/queries';
import { AbilityResponse } from '../Modules/components';
import { nightmares } from '../Modules/liminal';
import delayedBuffs from "../Modules/delayedBuffs";
import { customHpBars } from '../Modules/customHpBars';

const dungeonInProgress = new Map<string, number>();
const nightmareSelected = new Map<string, number>();

const EMBED_COLOR = 0x034f20;
const startDate = new Date('2025-08-13 00:00:00');

interface BuffInfo {
    id: string;
    name: string;
    description: string;
    type: "player" | "enemy";
}

interface UserRunInfo {
    level: number;
    buffPool: Record<string, BuffInfo>;
    appliedBuffs: BuffInfo[];
    totalPoints: number;
}

const userRuns = new Map<string, UserRunInfo>();


const nightmareStory = {
    "summer2025": {
        "Tidalfish": ["You feel an infinite descend, as the void opens its great arms to welcome you. For a moment, you are weightless, as memories float past you like bokeh of lights, familiar yet uncertain.\n\nWithin seconds, water chaotically dashes past your cheek, as air bubbles snorkel up your nostrils, rinsing you anew. Your hands frantically sway through the muddy water, as you muster up your last bit of strength to ascend through the water- and finally reach the surface.\n\nAhead of you, a light shimmers, dimly lightning the stagnant water, expanding to a seemingly limitless horizon. A monstrous creature dives at the tail end, her eyes sharp, looking right through you as she levitates in the air briefly. You turn, but the paddling of fins enclose you..."],
        "Mari the poisonbearer": ["The tidalfish gently waddles her tail, shooting past the stagnant water, lighting it with a trail of cyan, glittering with gold. Behind you, ominous mumurs grow louder-\n\n\"Save us- save us- from the impending doom, the repeating circle...\"\n\nYou look back, but there's nothing but pitch darkness. You look in more detail, but there is still nothing, pure darkness. Perhaps it's the amplification of volume, or the nihility of the realm, you follow the trail of cyan, warming you and propelling your movement, like a mother's warm embrace- where you lose the aspect of time, and self.\n\nA ray of light blinds you, yet it grows in intensity, forcing you to hide your face behind your pale arms. A moment later, the scene is nothing but pure blueness, like the deepest part of glaciers. The temperature is freezing, as you shiver, wandering through the narrow hallway ahead of you with no end. Just before the awfully dull blue engulfs you, a lady in pink appears, her fingers lightly tapping on the walls of blue, releasing a mist of coral, scented as roses. You step backwards, as she turns to you, eyes lit red, horrifying yet hypnotizing."],
        "Sand Golem": ["The lady in pink pants, as she falls to her knees, her hand lightly placed on her chest. The floors of blue weaken, then collapse like structureless tiles. Walls fall and pile, as you run away from causation and effect, from becoming a part of the dominos.\n\nAn EXIT door! Euphoria fills you, that's the way out, surely! You leap with glee, eyes locked onto the door of finality, of escape.\n\nBut it's all too late, the floor below you fades into countless dust. Your hand reaches out to grab onto the door, but you are a feet away, as you fall once more- It didn't take long this time, as you land onto a field of golden, the sudden jolt immobilizing you for a moment. Your body eases and relaxes, as you gaze at the fluffy clouds in the sky, freely drifting as how the wind ran across the blue sky.\n\nYet something is off.\n\nThe clouds dramatically shift in shape,  distorting, then rise upwards. You feel a sensation of discomfort, as if in a rapidly climbing balloon.\n\n\"Rhu... Rhu...\"\n\nA pair of golden eyes envelop your view, steaming with heat. You scream, turning aback to run, just to see the very platform you are standing on is folding up, causing you to lose balance. It becomes clear to you, that you are on a golem's hand."],

        "Luminous (alter)": ["The golem breaks, but regenerates in quick succession. Sandstorms break from all sides, whirling up heaps of dust You instinctively raise your arm to block the raging wind, scratched by millions of fleeing rocks. You stumble your steps, directionless through the field of grit- then you hear a loud thud, as a gigantic hourglass falls onto the field, shattering into pieces of flying blades, while emptying its interiors of particulate matter.\n\nThrough the dense fog, you can barely make out a finger from the sky, snapping the golem that was just standing so victoriously- into half. The finger fiddles with the field of sand, as darkness infiltrates the scene, breaking all matter from within. You let out a feeble scream, as you muster up the courage to run- yet quickly loomed over by the finger, obscuring your path with its enormous shadow, as countless hands submerge from the ground. You turn, just to realize the fingers all pointing at you- you're encircled.\n\nYou look down at your body, as pitch black erodes it into the void. Internal organs twist, joints melt, bones crack, all returning to the void. You feel the power of erasure running up your spine, dancing around your mind as the final ritual. Your consciousness destabilizes- who are you? why are you here? why should you fight the void? As your eyes are overtaken by the void, you let out one last thought.\n\nYet, just as you are about to disappear, a faint chime pierces through the sandy landscape, soft, melodic, and impossibly distant. From the now void-infested sky that lies before you, you begin to feel a subtle warmth which pulses like a heartbeat, and from that pulse, light emerges. Not like sunlight, but something, purer, more gentle. Suddenly, you spot another being tearing through the void in the sky, lighting it up as they descend.\n\nAnd then, the finger falters.\n\nA silhouette of radiance appears in front of the cause of the fog, at the opposite side of the sky. From there, everything seems like a blur to you. One trail of pitch black darkness, and another of blinding light converge at the center of the battlefield. Then, at the center, a massive sphere of light and darkness swirls with two types of energy. One sinister, and the other protective."],
        "Bubble Captain": ["The streaks of black and white tear your vision, leaving behind trails of void and grace, frozen in time and space. Your weak legs barely carry you away from the battlefield, but the attacks leave you directionless...\n\nA pink dot appears in your sight, at first blurry, but rapidly expanding, consolidating, into a magnificent bubble, bursting with energy. You feel its warmth, alleviating you from the pain and sore in your joints and muscle, you regain the agility, as you leap to the bubble, it wraps around you, like a mother's loving hand caressing her baby. Scenes of purity flash past you, emotions of gratitude and amazement, as you drown in euphoria, as if praised by millions.\n\nTime is an unreal concept. You twiddle with the golden mist, as you fall flat in the fluff. The place of utter perfection becomes your world- and confines you. You run in circles, as your boredom sends cracks around the fuming world- The cracks grow larger- and you cry, as the familiar streaks of black and white reappear in your view. You wonder whether escape is futile, whether you should just give up, and forever rest in the bubble-\n\nThe cracks widen and connect- The bubble pops in a sudden, as you are sent into a burst of white, contorting to the thrust- you instinctively grab hold of the nearest object- in blindness, you feel a wet gel, gooey- then solid, hard, somewhat cooling... You grab onto the angular object and pull yourself closer, water quickly fills the surrounding, as a pair of cyan eyes stare right into your chest. Frightened, you look downwards, as you realize countless wounds and scratches on your skin, blood oozing out fiercely, as sharks turn their head to you. Panicked, you freeze, as countless bubbles float across the ocean near you. Inside nothing remains, but detached flesh from the skeleton, all the visitors falling prey to the illusion. The shark's metal armor grazes your back, as your hands waddle with great force in the water. You hear the rubbing of their teeth, the aggressive tail wags- Maybe getting lost forever in the bubble was the better option."],
        "Dalus the nightmare": ["The floor beneath you crumbles, dissolving into matter of darkness. The top view shrinks as you plunge into dread. Your screams echo within the chamber, overlapping, amplifying, and grating against your ears. Air rushes past your aching back and feeble arms, violently battering your flailing body. As the faint light above dims and is swallowed by the darkness, you close your dry eyes and brace yourself for the fall, the fall that will pave the way for escape once and for all.\n\nA soft ray of light pierces through the thick walls of desolation, lifting you gently amidst the rushing air. You gaze toward the light, only to meet a man’s icy blue eyes, piercing through the mist. A broken shell dangles from his necklace, and as he blinks, blue petals drift toward you. The accompanying flora and fauna soothe your frayed nerves with their quiet serenity.\n\nThe light grows stronger, illuminating the darkness in an ethereal sky-blue glow, interwoven with threads of golden leaves. Your wounds mend, strength returning to each movement you make… Yet suddenly, the light fades, and the gloom of crimson petals rises, carrying the fragrance of roses alongside their piercing thorns. You shiver as the thorns inch closer, their sharp edges yearning for blood. Another broken shell hangs from a necklace. This time around the neck of a different man. Fury and decay overflow from his eyes as muted grey tears slide down his cheeks, dripping silently into the abyss.\n\nThe broken shells hum, resonating in unison. Blue petals return to the thorned wasteland, pushing back the blood-red advance. The battlefield shatters into a blur of ocean and sunlit sky, erupting with breathtaking yet brutal screeches of magical onslaughts. Amid the chaos, you glimpse a faint softness within the relentless wave of spells, as the broken shells hum louder and louder, harmonizing angst and despair. Clinging to tattered petals with all your strength, you are whipped and spun by the exploding magic, your body trembling with nausea..."],
        "Solarion": ["The world trembles beneath your feet. The ground splits, scorched by a brilliance too fierce for mortal sight. Two suns blaze in the sky, one bound to a towering figure wreathed in unstoppable pride, the other to an eldritch being clad in molten-gold-like skin, radiating celestial fury.\n\nThe air is fire. You stagger backward, shielding your eyes as molten light spills across the battlefield, igniting the heavens. The first figure steps forward, his sheer presence warping the air, and with a single word, the earth groans as if bowing to his authority. The golden beast answers not with speech but with fury; his claws, forged of condensed sunlight, erupt in incandescent arcs, slicing through the searing sky and drowning all shadow.\n\nYour breath catches in your throat. Heat lashes your skin raw, and your legs tremble beneath the storm of brilliance. There is no room for darkness here, only radiance and annihilation.The axe rises, gleaming brighter than the sun itself, and with its swing comes a crescent of light that splits the horizon apart. The beast answers in kind, his claws bursting into violent novas, collapsing into themselves before exploding outward. Their clash births a shockwave of brilliance so fierce that your senses are consumed. You cannot tell if your eyes are open or closed.\n\nYou scream, but no sound escapes.\n\nThe explosion hurls you from the ground, your body weightless in the storm. Air has turned molten; every breath tears at your lungs like fire itself. You are nothing more than a speck caught between gods.\n\nLight devours everything. Heat crushes, suffocates, obliterates.\n\nYet through the inferno, you glimpse them: one, standing unbent and unbroken, pride radiating from every motion; the other, fury incarnate, his presence as relentless as the blazing star above him. Their gazes lock, and the world bows beneath their wills.\n\nWhen they collide once more, heaven itself splits open. You are thrown backward into ash and ruin as a pillar of radiance pierces the sky, dissolving cloud and stone alike. For an instant, you see them, silhouettes framed in molten gold, their strikes shaking creation. A duel between suns.\n\nYour vision falters. The roar of their power drowns out thought itself. As you fade, you cling to the image: pride meeting fury, radiance warring with radiance. The sky burns, the ground shatters, and the world waits for the victor of this apocalyptic brilliance."],
        "Victoria the Dragonslayer": ["The blaze fades, unlike the shapes burned into your vision even after the heat disappeared. The air feels lighter now, but the memory of fire clings to your skin, and every breath carries the faint taste of ash.\n\nMist slides in from nowhere, curling around your legs, cool enough to make you shiver. Above, the stars shift too quickly, snapping into jagged patterns that drip faint blue into the dark sky. But the stillness is heavy, carrying a sharp metallic scent.\n\nSomething moves on the horizon. A figure, slow and steady, her armor catching what little light remains. Black steel, traced with ember-like glow, frames a face both calm and unyielding. Her eyes—bright, molten gold—pin you in place. The blade at her side tilts upward, not rushed, not hesitant, just certain. And for a moment, it feels like the stars themselves are watching, waiting, for her to strike."],
        "Anastasia": ["The Dragonslayer’s blade lowers, but not in surrender, only in silence. Her golden, reptilian eyes hold you for a moment longer before the stars above shatter into blue fragments, spilling light that fades as it falls. You step back, and she’s gone, as if the horizon itself swallowed her whole.\n\nThe battlefield melts away, blue giving way to a dim amber glow. Ahead, a single door stands ajar, warm light spilling across the floor in uneven stripes.\n\nInside, the scent of roses clings to the air. She sits on the bed, silver hair touched with faint pink tones catching the light, red eyes locked on you with a still smile. Then, her outline ripples: eyes flickering red to pale and back again. The light hums low, bending in pitch.\n\nHer head tilts. The movement stutters, then continues as if nothing happened. The smile remains, until her hand shifts ever so slightly toward the blade at her side."],
        "Espathera": ["The ice-cold floor sends pure chill up your spine, piercing through your heart, forcing you to get up from the metal floor. Tall columns rise up to the sky, as the moonlight streams through the enormous stained glass window, casting magnified pale patterns on the marble floor beneath you.. A wave of panic snaps in, as your movements are slowed by the weight of armor -- the typical guard attire of Camelot. You try to look for the exit, but you see the line of guards walking in -- It's not the time yet, you'll get caught. You join in the line of guards, steadying your sight as you watch over the silent corridors of the castle of Camelot, blending in with the oblivious group in eerie silence.\n\nThen, a piece of glass shatters.\n\nFollowed by a scream, the agony tearing the solace apart. Sharp clatters of armor follows, the shrill paining your ear, as it echoes through the hallways. You tighten your first, forcing yourself to straighten up and leave the castle. You run into an empty room, but the noise comes to a sudden halt. You tremble, looking out the room. The halls are deserted -- No patrols. No footsteps, but filled with the scent of blood. You feel your ear ringing, as the heavy, cluttered air extend their invisible hands,  suffocating you with every step.\n\nYou unlatch the door to the throne room, half-expecting to find the other guards stationed nearby. That’s when you see her, striding towards the monarch of Camelot. You try to flee, but your legs give in. You lose balance and fall on the floor, causing a loud crash.\n\nThe woman cloaked in shifting shadows strides the hallway, her eyes fixate on the monarch, casually looking over her shoulder in ethereal radiance. The woman turns her head and extends her hand with elegance, as a massive, dark lance materializes from the void, its edges pulsing with a faint, malevolent glow. Behind her, clattering can once again be heard, as a hoard of guards hover, their eyes filled with dread and a shady smile.\n\nShe chuckles, confident and cruel. You hide under the table, it is evident that only one of them will leave this room alive."],
        "Icecream": ["Glass panes all around shatter, as shards fly and caress your levitating body, before gusts of pure blizzard bursts in, pain-inducing chills crawls down your throat, rime condenses swiftly in the tattered throne room. Catching your breath, frost glistens, lungs shrinking in pain.\n\nThunder roars from the distance, the omen of disaster. Sparkling blue ice glazes throughout the castle, glazing across bricks and columns, freezing everything in its path. The cracking and popping blue ice streaks rapidly towards you, cleaving through the air. The salient spike only halts centimeters away from your pupils, as if a play to your pumping heart.\n\n\"BANG\", A massive thunderbolt shatters the rhythmic blow of wind, as icicles shower down in collective bombardment, propelling the blizzard's rampage. Snow rapidly accumulates into mounds,  as your vision becomes a hazy blur of white, as the terrain seems to shift into monstrous beings, opening their jagged jaw, as their preying eyes lock onto the last bit of warmth pulsing through your veins, their jaw dripping in melting ice, readying for a warm meal in the snowy plains.\n\nYour skin stings, your brain freezes, your movement cripples... Your muffled footsteps echo, each step getting heavier. Blazing determination seems to be a far gone joke, as every breathe becomes increasingly taxing. The icy storm finally subsides ahead of you, shaking your bare consciousness awake for brief moments. A figure clad in navy blue slowly turns his head to you, his smile malicious and cunning.\n\n\"Leave me to it.\" A bold voice lifts the heavy atmosphere. She steps up front, every step firm across the everchanging snow, as if eternal, final, and ever-present. The snowstorm rages once more, pulling you into into the swirl of certain doom, as the blues clash and counter, stride and strike... Your heavy eyelids flutter for a few more times, then finally lay shut."],
        "Juliette": ["Glistening water splashes as you paddle through the shallow waters, circled by walls of pure white. Light playfully dances around the corners of the walls, warming the room and releasing your burdened body.\n\nYou chuckle, and stop. What if you give up progressing, and decide to just fall onto the water? You spreads your hands, as you fall flat into the water. The following waves enlarge, spread, then stops by the walls. You gaze onto the ceiling, as white as the wall, slowly drawing your focus. But you don't care.\n\n*Please, give my heart a break*\n\nYour close your eyes, as thoughts twirl around your mind, gracefully ascending into the hollow above, losing its trace. Water gently brushes past your scars and strains, refreshing yet surreal. It should hurt, but it doesn't. It's as if it's all a play in a mind...\n\nYou hear the heavy blowing of snow, then the clattering of armor, followed by the flickering of blades, the roars of a warrior, the crumbling of ash, the fluttering of petals, the collision of bubbles, the swirling of the radiant and void, the drifting of sand, the tapping of fingers, and alas, the sound of water, brushing past your cheek... All coming back to you now.\n\nYou observe the environment around you. The liminal stages merge and melt, joining together as one, colors infusing like paint. The elevation of fields destabilize, collapsing and crumbling onto one another. You blink, and their interconnected points become a shade of grey, dull and fragile, becoming one with the background of nothingness.\n\nThe grey join, twist, flip, and consolidate. At first a tail, then scales, fins, alas, a mermaid, folding her arms on the stacking levees, alas awakening her gaze.\n\n*He was my whole world, I wish to see him once more...*\n\nWho? You instinctively question, retreating to the walls of white, the last piece holding together amidst the churning colors.\n\n*Everything collapses when he isn't here, don't make me dance in the void...*\n\nWhat? You blurt out, quickly holding your mouth shut, as she arched her back, lifting her chest to the void. You clutch your pearls, just as a flash of gold snaps into the forcefield, at first swallowed by the grey, but quickly reinforcing, shimmering with a blinding spark.\n\n*It's you... the listener to my lullaby, my first and my last...*\n\nA myriad of stars twinkle, as shooting stars adrift light up the grandeur of the galaxy. Yet the stars burn bright, resisting the lone shine of the moon, like an oath of sacrifice in blood, bursting in veins of intertwined fate.\n\n*It's not you.*"],
    },
};

const randomBuffs: Record<string, BuffInfo> = {
    // --- Enemy Buffs ---
    berserk_fury: {
        id: "berserk_fury",
        name: "Berserk Fury",
        description: "**+20%** enemy's ATK & MD",
        type: "enemy",

    },
    iron_bastion: {
        id: "iron_bastion",
        name: "Iron Bastion",
        description: "**+20%** enemy's DEF & MR",
        type: "enemy",

    },
    death_eye: {
        id: "death_eye",
        name: "Death Eye",
        description: "**+25%** critical rate",
        type: "enemy",

    },
    ruthless_precision: {
        id: "ruthless_precision",
        name: "Ruthless Precision",
        description: "**+50%** critical damage",
        type: "enemy",

    },
    arcane_barrier: {
        id: "arcane_barrier",
        name: "Arcane Barrier",
        description: "**+20%** enemy's DMG mitigation",
        type: "enemy",

    },
    counter_instinct: {
        id: "counter_instinct",
        name: "Counter Instinct",
        description: "**+20%** enemy's counter chance",
        type: "enemy",

    },
    titan_blood: {
        id: "titan_blood",
        name: "Titan Blood",
        description: "**+20%** enemy's max HP",
        type: "enemy",

    },
    phantom_step: {
        id: "phantom_step",
        name: "Phantom Step",
        description: "**+20%** enemy's dodge rate",
        type: "enemy",

    },
    mana_surge: {
        id: "mana_surge",
        name: "Mana Surge",
        description: "**+10** enemy's mana regeneration",
        type: "enemy",

    },
    regenerative_aura: {
        id: "regenerative_aura",
        name: "Regenerative Aura",
        description: "Recovers **4%** max HP every round",
        type: "enemy",

    },
    shielded_spawn: {
        id: "shielded_spawn",
        name: "Shielded Spawn",
        description: "Begins battles with a shield of **25%** max HP",
        type: "enemy",

    },
    war_frenzy: {
        id: "war_frenzy",
        name: "War Frenzy",
        description: "Doubles ATK, MD, DEF & MR during the first **2** rounds",
        type: "enemy",

    },

    // --- Player Debuffs ---
    shattered_might: {
        id: "shattered_might",
        name: "Shattered Might",
        description: "**-20%** ATK & MD",
        type: "player",

    },
    brittle_guard: {
        id: "brittle_guard",
        name: "Brittle Guard",
        description: "**-20%** DEF & MR",
        type: "player",

    },
    dulled_edge: {
        id: "dulled_edge",
        name: "Dulled Edge",
        description: "**-25%** critical rate",
        type: "player",

    },
    cracked_focus: {
        id: "cracked_focus",
        name: "Cracked Focus",
        description: "**-50%** critical damage",
        type: "player",

    },
    marked_target: {
        id: "marked_target",
        name: "Marked Target",
        description: "Takes **+15%** damage",
        type: "player",

    },
    cursed_vitality: {
        id: "cursed_vitality",
        name: "Cursed Vitality",
        description: "**-20%** max HP",
        type: "player",

    },
    slipping_shadow: {
        id: "slipping_shadow",
        name: "Slipping Shadow",
        description: "**-20%** dodge rate",
        type: "player",

    },
    mana_drought: {
        id: "mana_drought",
        name: "Mana Drought",
        description: "**-10** mana regeneration",
        type: "player",

    },
    half_life: {
        id: "half_life",
        name: "Half-Life",
        description: "HP can never be more than **50%** at the start of a round",
        type: "player",

    },
    retributive_pain: {
        id: "retributive_pain",
        name: "Retributive Pain",
        description: "Takes **12%** of own DMG dealt",
        type: "player",

    },
    cycle_of_exhaustion: {
        id: "cycle_of_exhaustion",
        name: "Cycle of Exhaustion",
        description: "The player's ATK, MD and Block rate is reduced to **0** every **5** rounds",
        type: "player",

    },
    exposed: {
        id: "exposed",
        name: "Exposed",
        description: "Removes shield at the start of the round and reduces max HP by **8%**",
        type: "player",

    },
};


function getNightmareButtonRow(tab: string): ActionRowBuilder<ButtonBuilder> {
    const buttons = [
        new ButtonBuilder()
            .setCustomId('play')
            .setLabel("Descend")
            .setStyle(ButtonStyle.Success)
            .setDisabled(tab === "story" || tab === "tutorial"),
    ];


    if (tab === "overview" || tab === "story") {
        buttons.push(
            new ButtonBuilder()
                .setCustomId('story')
                .setLabel(tab === "story" ? "Show Overview" : "Show Story")
                .setStyle(ButtonStyle.Primary)
        );
    };

    if (tab === "overview" || tab === "tutorial") {
        buttons.push(
            new ButtonBuilder()
                .setCustomId('tutorial')
                .setLabel(tab === "tutorial" ? "Show Overview" : "How to play")
                .setStyle(ButtonStyle.Primary)
        );
    };

    if (tab === "overview") {
        buttons.push(
            new ButtonBuilder()
                .setCustomId('ignore_defer-edit')
                .setLabel(`Edit Build`)
                .setStyle(ButtonStyle.Secondary),

        );
    };

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...buttons);
};

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_nightmare_' + uid)
        .setTitle('Edit Class')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('class')
                    .setLabel("Class name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Paladin (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('weapon')
                    .setLabel("Weapon name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Excalibur (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('shield')
                    .setLabel("Shield name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Tyranny (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('set')
                    .setLabel("Set name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Aureate (type "remove" to remove)')
                    .setRequired(false)
            ),
        );
};

async function buffSelection(interaction: ChatInputCommandInteraction, level: number): Promise<void> {
    const lvlKey = `${interaction.user.id}_${level}`;
    // Get existing run data
    const runData = userRuns.get(lvlKey);

    if (!runData) {
        console.warn("buffSelection called without existing run data");
        return;
    };

    let currentBuffs = Object.values(runData.buffPool);
    let selectedBuffs = _.sampleSize(currentBuffs, Math.min(3, currentBuffs.length));

    // If no buffs left in pool, proceed directly to next level
    if (selectedBuffs.length === 0) {
        setTimeout(() => {
            interaction.followUp({
                content: `:grey_exclamation: **No more add-on effects available!** Continuing Stage ${level + 1} (Level ${runData.level + 1})...\n\nUse \`/liminal descent\` to continue your fight!`
            });
        }, 2000);
        return;
    };

    const buffEmbed = new EmbedBuilder()
        .setTitle(`<:tada:1402572115282231369> Stage ${level + 1} (Level ${runData.level}) Cleared!`)
        .setDescription(
            `Pick your poison:\n\n` +
            selectedBuffs.map((buff, index) =>
                `**${index + 1}.** ${buff.name} ${buff.type === "enemy" ? "⚫ **[Enemy Buff]**" : "🟡 **[Player Debuff]**"}\n*${buff.description}*`
            ).join("\n\n") +
            `\n\n**Next**: Continue Stage ${level + 1} (Level ${runData.level + 1})`
        )
        .setColor(EMBED_COLOR)
        .setFooter({ text: `Active add-on effects: ${runData.appliedBuffs.length} | Available add-on effects: ${currentBuffs.length}` });

    const buffRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            ...selectedBuffs.map((buff, index) =>
                new ButtonBuilder()
                    .setCustomId(`buff_${buff.id}`)
                    .setLabel(`${index + 1}. ${buff.name}`)
                    .setStyle(buff.type === "enemy" ? ButtonStyle.Danger : ButtonStyle.Success)
            )
        );

    if (interaction.channel?.isSendable()) await interaction.channel.send({ embeds: [buffEmbed], components: [buffRow] }).then(msg => {
        const buffCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId.startsWith("buff_"), componentType: ComponentType.Button, time: 120000, max: 1 });

        buffCollector.on('collect', async (buttonInteraction) => {

            const buffId = buttonInteraction.customId.substring("buff_".length);
            const selectedBuff = runData.buffPool[buffId];

            if (!selectedBuff) {
                if (buttonInteraction.channel?.isSendable()) await buttonInteraction.channel?.send({ content: "❌ Invalid buff selection!" });
                return;
            };

            // Clear restrictions
            dungeonInProgress.delete(interaction.user.id);

            // Apply the buff
            delete runData.buffPool[buffId];
            runData.appliedBuffs.push(selectedBuff);
            userRuns.set(lvlKey, runData);

            // Update the embed to show selection
            const updatedEmbed = buffEmbed
                .setTitle(`<:checkmark:1403330138975895643> Add-on effect Selected!`)
                .setDescription(`**${selectedBuff.name}** has been added to your arsenal!\n\n*${selectedBuff.description}*\n\n🌙 **Starting Stage ${level + 1} (Level ${runData.level + 1})...**`)
                .setFooter({ text: `Total Active effects: ${runData.appliedBuffs.length}` });
            await msg.edit({ embeds: [updatedEmbed], components: [] });

            // Auto-proceed to next level after a short delay
            setTimeout(async () => {
                if (buttonInteraction.channel?.isSendable()) await buttonInteraction.channel?.send({ content: `🌠 **Stage ${level + 1} (Level ${runData.level + 1}) is starting!**\n\nUse \`/liminal descent\` to continue your fight!` });
            }, 500);
        });

        buffCollector.on('end', async (collected) => {
            if (collected.size === 0) {
                // Clear restrictions
                dungeonInProgress.delete(interaction.user.id);

                // Timeout - auto selecting first buff
                const firstBuff = selectedBuffs[0];

                if (firstBuff && runData) {
                    delete runData.buffPool[firstBuff.id];
                    runData.appliedBuffs.push(firstBuff);
                    userRuns.set(lvlKey, runData);

                    await msg.edit({
                        embeds: [
                            buffEmbed.setTitle(`⏱️ Time's Up!`)
                                .setDescription(`**${firstBuff.name}** was automatically selected.\n\n*${firstBuff.description}*\n\n🌙 **Starting Stage ${level + 1} (Level ${runData.level + 1})...**`)
                                .setFooter({ text: `Total Active effects: ${runData.appliedBuffs.length}` })
                        ],
                        components: []
                    });

                    // Auto-proceed after timeout
                    setTimeout(async () => {
                        if (interaction.channel?.isSendable()) await interaction.channel.send({ content: `🌠 **Stage ${level + 1} (Level ${runData.level + 1}) is starting!**\n\nUse \`/liminal descent\` to continue your fight!` });
                    }, 1000);
                };
            };
        });

    });
};

function nightmareOverview(interaction: ChatInputCommandInteraction, stats: CompactUserSchema, userItems: itemInfo[]): Promise<number> {
    return new Promise((resolve) => {
        let level = nightmareSelected.get(interaction.user.id) ?? 0;

        const lvlKey = `${interaction.user.id}_${level}`;
        let runData: UserRunInfo = userRuns.get(lvlKey) ?? {
            level: 0,
            buffPool: _.cloneDeep(randomBuffs),
            appliedBuffs: [],
            totalPoints: 0,
        };
        userRuns.set(lvlKey, runData);

        let currentNightmare = nightmares[level];
        let preselectedChar = currentNightmare.preSelectedChar;
        let nightmareImage = currentNightmare.enemy.image[0];
        // EDIT BACK LATER
        // let levelsUnlocked = 9999; startDate; // Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        let levelsUnlocked = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        let options: SelectMenuComponentOptionData[] = [];
        nightmares.slice(0, levelsUnlocked).forEach((e) => {
            const lvlKey = `${interaction.user.id}_${e.id}`;
            const progress = userRuns.get(lvlKey)?.level ?? 0;
            const activeBuffs = userRuns.get(lvlKey)?.appliedBuffs.length ?? 0;

            options.push({
                label: `Stage ${e.id + 1}: ${e.name}`,
                emoji: (e.id in stats.craze_levels) ? stats.craze_levels[e.id] ? '<:check_icon:683671903143067743>' : '<:stop_icon:683671917353369600>' : '<:pause:690939144225947668>',
                description: `Levels cleared: ${progress} | Active Buffs: ${activeBuffs}`,
                value: `${e.id}`,
            });
        });

        const selectionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('level_selection')
                    .setPlaceholder('Select a level to play on...')
                    .addOptions(options),
            );

        let tab: "overview" | "story" | "tutorial" = "overview";

        // console.log(characters[preselectedChar].name);
        const getDesc = () => {
            if (tab === "overview") {
                return `### :crescent_moon: Liminal Descent    ྀིྀ ♁ ₊ :wing:｡˚ ₊ +`
                    + `\n\n**Enemy**: __${currentNightmare.name}__`
                    + `\n\n**Traits**\n- ${currentNightmare.ability?.list[0].join("\n- ")}`
                    + `\n### Your Character\n**Name**: ${preselectedChar ? characters[preselectedChar].name + " Lvl. 500" : "`None`"}\n`
                    + `**Class**: ${"class" in stats.craze_equipment ? classes[stats.craze_equipment.class].name + classes[stats.craze_equipment.class].emblem + "Lvl. 1000" : "`None`"}\n`

                    // `**Equipment**: ${userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>"}${userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>"} ${userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>"}${userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>"}${userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>"}${userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>"}`
                    + `**Equipment**: ${"weapon" in stats.craze_equipment ? (isNaN(stats.craze_equipment.weapon.split(":")[0]) ? stats.craze_equipment.weapon : items[stats.craze_equipment.weapon.split(":")[0]].emoji) : "<:sword_empty:1034502134474997790>"}${"shield" in stats.craze_equipment ? items[stats.craze_equipment.shield.split(":")[0]].emoji : "<:shield_empty:1087089686809415730>"} ${"helmet" in stats.craze_equipment ? items[stats.craze_equipment.helmet.split(":")[0]].emoji : "<:helmet_empty:1034499888878198885>"}${"cuirass" in stats.craze_equipment ? items[stats.craze_equipment.cuirass.split(":")[0]].emoji : "<:cuirass_empty:1034499890165858305>"}${"gloves" in stats.craze_equipment ? items[stats.craze_equipment.gloves.split(":")[0]].emoji : "<:gloves_empty:1034499892409794570>"}${"boots" in stats.craze_equipment ? items[stats.craze_equipment.boots.split(":")[0]].emoji : "<:boots_empty:1034499893919764480>"}${("weapon" in stats.craze_equipment || "shield" in stats.craze_equipment || "helmet" in stats.craze_equipment) ? " Lvl. 120/120" : ""}`

                    + `\n**Items**: <:rune_empty:1034507494539669635> `
                    + userItems.filter((e) => e.category === "ring").map((e) => e.emoji).concat(
                        Array(Math.max(0, getRingSlotsTotal(stats) - userItems.filter((e) => e.category === "ring").length)).fill("<:ring_empty:1034509903886299136>")
                    ).concat(["<:locked:1034511902417621002>", "<:locked:1034511902417621002>", "<:locked:1034511902417621002>"]).slice(0, 3).join("");
            } else if (tab === "story") {
                return `### ${currentNightmare.name}'s Story\n${nightmareStory["summer2025"]?.[currentNightmare.name as keyof typeof nightmareStory["summer2025"]]?.join("\n")}`;
            } else if (tab === "tutorial") {
                return `### 🎓 Tutorial\n\n` +
                    `**<:target:1403330155186749450> Objective:** Progress as far as possible without losing to maximize your rewards!\n\n` +

                    `**How to Play:**\n` +
                    `<:one:1403330141672964217> **Select a Stage** - Choose from unlocked liminal stages (1 new stage unlocks daily)\n` +
                    `<:two:1403330145175212093> **Fight the Boss** - Battle using the preselected character (Lvl. 500) + your class (Lvl. 1000) + your equipment\n` +
                    `<:three:1403330147607773296> **Choose Your Effect** - After winning, pick 1 from 3 random effects to strengthen the difficulty\n` +
                    `<:four:1403330149549867109> **Repeat & Stack** - Fight the same boss again with your accumulated effects\n` +
                    `<:five:1403330151642828810> **Push Higher** - Continue until you lose, earning more rewards the further you progress\n\n` +

                    `**Effect System:**\n` +
                    `🟡 **Player Debuffs** - Weaken your character's abilities\n` +
                    `⚫ **Enemy Buffs** - Enhance the boss's abilities\n` +
                    `<:streak:1403330158487933035> **Stacking** - All chosen buffs remain active throughout your run\n` +
                    `<:dice:1403330160152809482> **Random Selection** - Different buff options each time\n\n`;

            }
            return "";
        };

        const Embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setThumbnail(nightmareImage)
            .setDescription(getDesc())
            .setFooter({
                text: `${levelsUnlocked > nightmares.length - 1 ? `All levels have been unlocked!` : `Next level unlocks in ${(23 - new Date().getHours()) ? `${23 - new Date().getHours()}h ` : ""}${60 - new Date().getMinutes()}min`}`
            });
        interaction.reply({ embeds: [Embed], components: [selectionRow, getNightmareButtonRow(tab)] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "play", componentType: ComponentType.Button, time: 90000 });
            const edit = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit", componentType: ComponentType.Button, time: 90000 });
            const story = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "story", componentType: ComponentType.Button, time: 90000 });
            const select = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "level_selection", componentType: ComponentType.StringSelect, time: 90000 });
            const tutorial = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "tutorial", componentType: ComponentType.Button, time: 90000 });

            play.on('collect', () => {
                const userProgressCd = dungeonInProgress.get(stats.id);
                if (userProgressCd && userProgressCd > Date.now()) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((userProgressCd - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((userProgressCd - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((userProgressCd - new Date().getTime()) / 1000) % 60}**s`);
                    return;
                };
                dungeonInProgress.set(stats.id, Date.now() + (5 * 60 * 1000));
                resolve(level);
                play.stop();
            });

            edit.on('collect', (rr) => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModal(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_nightmare_' + uid), time: 90000 }).then(async (r) => {
                    const cls = r.fields.getTextInputValue('class');
                    const weapon = r.fields.getTextInputValue('weapon');
                    const shield = r.fields.getTextInputValue('shield');
                    const set = r.fields.getTextInputValue('set');

                    // Match class
                    if (cls) {
                        let getClass = searchClass(cls, interaction, true);
                        if (getClass?.name) {
                            stats.craze_equipment.class = getClass.id;
                        };
                        if (cls === "remove") delete stats.craze_equipment.class;
                    };

                    // Match weapon
                    if (weapon) {
                        if (weapon === "<:GojoHeart:1194021178029920266>") {
                            stats.craze_equipment.weapon = "<:GojoHeart:1194021178029920266>";
                        } else {
                            let getWeapon = searchItem(weapon, interaction, true);
                            if (getWeapon?.name) { // && getWeapon.type !== "shield") {
                                stats.craze_equipment.weapon = `${getWeapon.id}:706183309943767112`;
                            };
                            if (weapon === "remove") delete stats.craze_equipment.weapon;
                        };
                    };

                    // Match shield
                    if (shield) {
                        let getShield = searchItem(shield, interaction, true);
                        if (getShield?.name && getShield.type === "shield") {
                            stats.craze_equipment.shield = `${getShield.id}:706183309943767112`;
                        };
                        if (shield === "remove") delete stats.craze_equipment.shield;
                    };

                    // Match set
                    if (set) {
                        let getSet = searchItem(set, interaction, true, { returnSet: true });
                        if (getSet && getSet instanceof armorInfo) {
                            let setItems = (items.filter((item) => (item instanceof armorInfo && getSet instanceof armorInfo && item.setname === getSet.setname)) ?? []) as armorInfo[];
                            if (setItems.find((item) => item.type === "helmet")) {
                                const helmet = setItems.find((item) => item.type === "helmet");
                                if (helmet) stats.craze_equipment.helmet = `${helmet.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "cuirass")) {
                                const cuirass = setItems.find((item) => item.type === "cuirass");
                                if (cuirass) stats.craze_equipment.cuirass = `${cuirass.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "gloves")) {
                                const gloves = setItems.find((item) => item.type === "gloves");
                                if (gloves) stats.craze_equipment.gloves = `${gloves.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "boots")) {
                                const boots = setItems.find((item) => item.type === "boots");
                                if (boots) stats.craze_equipment.boots = `${boots.id}:706183309943767112`;
                            };
                        };
                        if (set === "remove") {
                            delete stats.craze_equipment.helmet;
                            delete stats.craze_equipment.cuirass;
                            delete stats.craze_equipment.gloves;
                            delete stats.craze_equipment.boots;
                        };
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        craze_equipment: { type: "set", value: stats.craze_equipment },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                });
            });

            story.on('collect', () => {
                tab = (tab === "overview") ? "story" : "overview";
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [selectionRow, getNightmareButtonRow(tab)] });
            });

            select.on('collect', r => {
                r.deferUpdate().catch(() => {
                    console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
                });

                let readVal = parseInt(r.values[0]);
                if (readVal >= levelsUnlocked) readVal = 0;

                level = readVal;
                nightmareSelected.set(interaction.user.id, level);

                currentNightmare = nightmares[level];
                preselectedChar = currentNightmare.preSelectedChar;
                nightmareImage = currentNightmare.enemy.image[0];

                const newLvlKey = `${interaction.user.id}_${level}`;
                if (!userRuns.has(newLvlKey)) {
                    const newRunData: UserRunInfo = {
                        level: 0,
                        buffPool: _.cloneDeep(randomBuffs),
                        appliedBuffs: [],
                        totalPoints: 0,
                    };
                    userRuns.set(newLvlKey, newRunData);
                }

                interaction.editReply({ embeds: [Embed.setDescription(getDesc()).setThumbnail(nightmareImage)], components: [selectionRow, getNightmareButtonRow(tab)] });
            });

            tutorial.on('collect', () => {
                tab = (tab === "overview") ? "tutorial" : "overview";
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [selectionRow, getNightmareButtonRow(tab)] });
            });

            play.on('end', () => {
                edit.stop(), story.stop(), tutorial.stop();
                resolve(-1);
            });

        });

    });
};

const exportCommand: SlashCommand = {
    name: 'liminal',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema;

        const myWeapons = await getWeaponSchemas([stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots, stats.equipment.ring1, stats.equipment.ring2, stats.equipment.ring3]);
        const userItems = myWeapons.map((e) => items[e.itemid]);
        // Level Selection
        let level = await nightmareOverview(interaction, stats, userItems);
        if (level === -1) return;

        let lvlKey = `${interaction.user.id}_${level}`;

        let runData: UserRunInfo | undefined = userRuns.get(lvlKey);

        // Set up restrictions
        // const cd = 8 * 60 * 1000;
        // if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
        // dungeonInProgress.set(stats.id, new Date().getTime() + cd);
        // setTimeout(() => {
        //     dungeonInProgress.delete(stats.id);
        //     // interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
        // }, cd);

        const currentNightmare = nightmares[level];
        const preselectedChar = currentNightmare.preSelectedChar;
        // Select Class
        stats.battlechar = preselectedChar;
        stats.char_ref[stats.battlechar] = 5;
        stats.shield_slot = 1;
        stats.level = 500;
        stats.bank = 1000000;
        if ("class" in stats.craze_equipment) {
            stats.class = stats.craze_equipment.class;
            stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, classLevelToXP(1000)]));
        } else stats.class = null;
        if ("weapon" in stats.craze_equipment) stats.equipment.weapon = stats.craze_equipment.weapon;
        else delete stats.equipment.weapon;
        if ("shield" in stats.craze_equipment) stats.equipment.shield = stats.craze_equipment.shield;
        else delete stats.equipment.shield;
        if ("helmet" in stats.craze_equipment) stats.equipment.helmet = stats.craze_equipment.helmet;
        else delete stats.equipment.helmet;
        if ("cuirass" in stats.craze_equipment) stats.equipment.cuirass = stats.craze_equipment.cuirass;
        else delete stats.equipment.cuirass;
        if ("gloves" in stats.craze_equipment) stats.equipment.gloves = stats.craze_equipment.gloves;
        else delete stats.equipment.gloves;
        if ("boots" in stats.craze_equipment) stats.equipment.boots = stats.craze_equipment.boots;
        else delete stats.equipment.boots;


        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        // Party chars
        const partyQuery = stats.party ? await getPartyMembers(stats.party, { excludeIds: [interaction.user.id], hasChristmasChar: true }) : [];
        let partyChars = partyQuery.map((e) => characters[e.craze_equipment.char]);

        // Enemy Stats
        let enemy = nightmares[level].enemy;
        const curse = curses[14];
        let eAbility = nightmares[level].enemy.ability;
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        let eStats = {
            "name": enemy.name,
            "hp": (enemy.setStats as any).hp,
            "maxhp": (enemy.setStats as any).hp,
            "atk": (enemy.setStats as any).atk,
            "md": (enemy.setStats as any).md,
            "def": (enemy.setStats as any).def,
            "mr": (enemy.setStats as any).mr,
            "ep": Infinity,
            "cr": 0.15,
            "cd": 1.2,
            "td": 10,
            "br": 0.12,
            "dodge": 0.1,
            "mana": (enemy.setStats as any).mana,
            "mg": 15,
            "sm": 0,
            "rev": 0,
            "revhp": 0,
            "shield": 0,
            "mdChance": 0,
            "removeDefCap": true,
            "image": eImage,
        } as any;

        // console.log("Enemy Stats: ", eStats);
        // Stat Adjustments
        if (enemy.setStats) Object.entries(enemy.setStats).forEach((e) => eStats[e[0]] = e[1]);
        if (enemy.multStats) Object.entries(enemy.multStats).forEach((e) => eStats[e[0]] = Math.floor(eStats[e[0]] * e[1]));
        if (enemy.addStats) Object.entries(enemy.addStats).forEach((e) => eStats[e[0]] += e[1]);

        let eStatsC = { ...eStats };

        // Some match settings
        const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Random HP Bar
        if (stats.user_settings.random_hp_bar && stats.hpbars.length > 0) {
            stats.hpbar = [null, ...stats.hpbars][Math.floor(Math.random() * (stats.hpbars.length + 1))];
        };
        const embedColor = stats.hpbar === null ? EMBED_COLOR : customHpBars[stats.hpbar].color;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        let resolved = false;
        async function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            const Embed = new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`🌙 Liminal Stage ${level + 1} (Level ${runData ? runData.level + 1 : 1})`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 256 }) });

            if (r === "l") {
                // Calculate score
                let finalScore = 0;
                if (runData && runData.appliedBuffs.length > 0) finalScore = Math.pow(runData.appliedBuffs.length, 2);

                // Reset run on loss
                if (runData) {
                    runData.level = 0;
                    runData.buffPool = _.cloneDeep(randomBuffs);
                    runData.appliedBuffs = [];
                    runData.totalPoints = 0;
                    userRuns.set(lvlKey, runData);
                };

                // Update craze_levels for tracking
                if (!(level in stats.craze_levels)) {
                    stats.craze_levels[level] = 0;
                    await updateUsers(interaction.user.id, {
                        craze_levels: { type: "set", value: stats.craze_levels },
                    });
                };

                // Clear restrictions
                dungeonInProgress.delete(stats.id);

                return Embed.setDescription(
                    `💀 **${myChar.name}** got lost in liminality... 💀\n\n` +
                    `<:tally:1403331476916801566> **Final Score: ${finalScore} points**\n\n` +
                    `<:repeat1:1403331474572185600> **Run Reset** - Starting over at Level 1\n\n`
                );
            };


            // Update run data
            let reachedNewMaxLevel = false;
            if (runData) {
                runData.level++;
                userRuns.set(lvlKey, runData);

                stats.craze_levels[level] ||= 0;
                if (runData.level > stats.craze_levels[level]) {
                    reachedNewMaxLevel = true;
                    stats.craze_levels[level] = runData.level;
                };
            };

            // Coins
            let loot = 0;
            if (reachedNewMaxLevel && stats.craze_levels[level] <= 10) {
                loot = 400 + Math.floor(Math.random() * 200) + (level * 100);
            };

            const receivedFirstExPullReward = reachedNewMaxLevel && stats.craze_levels[level] === 1;
            const receivedSecondExPullReward = reachedNewMaxLevel && stats.craze_levels[level] === 8;

            // Update users table
            const newUpdates: UpdateUserOptions = {
                craze_levels: { type: "set", value: stats.craze_levels },
            };
            if (receivedFirstExPullReward) newUpdates.expulls = { type: "increment", value: 1 };
            if (receivedSecondExPullReward) newUpdates.expulls = { type: "increment", value: 1 };
            if (loot) newUpdates.coins = { type: "increment", value: loot };
            await updateUsers(interaction.user.id, newUpdates);

            await buffSelection(interaction, level);

            return Embed
                .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Level ${level + 1} progress: **${stats.craze_levels[level]}**/${1}${loot ? `\n<a:arrow_orange:916716747623641210> **${loot}** coins <:coins:872926669055356939>` : ""}${receivedFirstExPullReward || receivedSecondExPullReward ? `\n<a:arrow_blue:1179933798016745623> **1x** <a:EXTRA:1138530846144462968>` : ""}`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        let matchStats = Avalon.getMatchStats(interaction, { allowExecution: false });
        matchStats.actionSequence = [];
        let notice = ["", "", "", ""];

        // Apply passives
        if (eAbility) await eAbility.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo).setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (runData && runData.appliedBuffs.length > 0) {
            runData.appliedBuffs.forEach(buff => {

                switch (buff.id) {
                    //+20% enemy's ATK & MD
                    case "berserk_fury":
                        eStatsC.atk = Math.floor(eStatsC.atk * 1.2);
                        eStatsC.md = Math.floor(eStatsC.md * 1.2);
                        eBuffs.atk.push(new buffInfo("*", 1.2, 9999));
                        eBuffs.md.push(new buffInfo("*", 1.2, 9999));
                        break;
                    //+20% enemy's DEF & MR
                    case "iron_bastion":
                        eStatsC.def = Math.floor(eStatsC.def * 1.2);
                        eStatsC.mr = Math.floor(eStatsC.mr * 1.2);
                        eBuffs.def.push(new buffInfo("*", 1.2, 9999));
                        eBuffs.mr.push(new buffInfo("*", 1.2, 9999));
                        break;
                    //+25% enemy's critical rate
                    case "death_eye":
                        eStatsC.cr += 0.25;
                        eBuffs.cr.push(new buffInfo("+", 0.25, 9999));
                        break;
                    //+50% enemy's critical damage
                    case "ruthless_precision":
                        eStatsC.cd += 0.5;
                        eBuffs.cd.push(new buffInfo("+", 0.5, 9999));
                        break;
                    //+20% enemy's DMG Reduction
                    case "arcane_barrier":
                        eStatsC.damageReduction = 0.2;
                        break;
                    //+20% enemy's counter chance
                    case "counter_instinct":
                        eStatsC.counter ??= 0;

                        myStatsC.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            if (Math.random() < 0.2) eStatsC.counter++;
                            return AbilityResponse.SUCCESS;
                        }, 9999));

                        break;
                    //+20% enemy's max HP
                    case "titan_blood":
                        eStatsC.maxhp = Math.floor(eStatsC.maxhp * 1.2);
                        eStatsC.hp = Math.floor(eStatsC.hp * 1.2);
                        break;
                    //+20% enemy dodge rate
                    case "phantom_step":
                        eStatsC.dodge += 0.2;
                        if (eStatsC.dodge > 1) eStatsC.dodge = 1;
                        eBuffs.dodge.push(new buffInfo("+", 0.2, 9999));
                        break;
                    //+10% enemy's mana regeneration
                    case "mana_surge":
                        eStatsC.mg += 10;
                        eBuffs.mg.push(new buffInfo("+", 10, 9999));
                        break;
                    //Recovers 4% max HP every round
                    case "regenerative_aura":
                        eBuffs.hp.push(new buffInfo("+", Math.floor(eStatsC.maxhp * 0.04), 9999));
                        break;
                    //Begins battles with a shield of **25%** max HP
                    case "shielded_spawn":
                        const shieldAmount = Math.floor(eStatsC.maxhp * 0.25);
                        eStatsC.shield += shieldAmount;
                        break;
                    //Doubles ATK, MD, DEF & MR during the first 2 rounds
                    case "war_frenzy":
                        eBuffs.atk.push(new buffInfo("*", 2, 2));
                        eBuffs.md.push(new buffInfo("*", 2, 2));
                        eBuffs.def.push(new buffInfo("*", 2, 2));
                        eBuffs.mr.push(new buffInfo("*", 2, 2));
                        break;
                    //-20% ATK & MD
                    case "shattered_might":
                        myStatsC.atk = Math.floor(myStatsC.atk * 0.8);
                        myStatsC.md = Math.floor(myStatsC.md * 0.8);
                        buffs.atk.push(new buffInfo("*", 0.8, 9999));
                        buffs.md.push(new buffInfo("*", 0.8, 9999));
                        break;
                    //-20% DEF & MR
                    case "brittle_guard":
                        myStatsC.def = Math.floor(myStatsC.def * 0.8);
                        myStatsC.mr = Math.floor(myStatsC.mr * 0.8);
                        buffs.def.push(new buffInfo("*", 0.8, 9999));
                        buffs.mr.push(new buffInfo("*", 0.8, 9999));
                        break;
                    //-25% critical rate
                    case "dulled_edge":
                        myStatsC.cr -= 0.25;
                        if (myStatsC.cr < 0) myStatsC.cr = 0;
                        buffs.cr.push(new buffInfo("+", -0.25, 9999));
                        break;
                    //-50% critical damage
                    case "cracked_focus":
                        myStatsC.cd -= 0.5;
                        if (myStatsC.cd < 0) myStatsC.cd = 0;
                        buffs.cd.push(new buffInfo("+", -0.5, 9999));
                        break;
                    //Takes +15% damage
                    case "marked_target":
                        myStatsC.vulnerability ??= 1;
                        myStatsC.vulnerability += 0.15;
                        break;
                    //-20% max HP
                    case "cursed_vitality":
                        myStatsC.maxhp = Math.floor(myStatsC.maxhp * 0.8);
                        myStatsC.hp = Math.floor(myStatsC.hp * 0.8);
                        break;
                    //-20% dodge rate
                    case "slipping_shadow":
                        myStatsC.dodge -= 0.2;
                        if (myStatsC.dodge < 0) myStatsC.dodge = 0;
                        buffs.dodge.push(new buffInfo("+", -0.2, 9999));
                        break;
                    //-10 mana regeneration
                    case "mana_drought":
                        myStatsC.mg -= 10;
                        buffs.mg.push(new buffInfo("+", -10, 9999));
                        break;
                    //HP can never be more than 50% at the start of the round
                    case "half_life":
                        if (myStatsC.hp / myStatsC.maxhp > 0.5) myStatsC.hp = Math.floor(myStatsC.maxhp * 0.5);
                        myStatsC.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            if (myStatsC.hp / myStatsC.maxhp > 0.5) myStatsC.hp = Math.floor(myStatsC.maxhp * 0.5);

                            return AbilityResponse.SUCCESS;
                        }, 9999));
                        break;
                    //Takes 12% of DMG dealt
                    case "retributive_pain":
                        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === myStatsC) {
                                myStatsC.hp -= Math.floor(options.damage * 0.12);
                            };
                        });
                        break;
                    //The player's ATK,MD,Block rate is reduced to 0 every 5 rounds
                    case "cycle_of_exhaustion":
                        myStatsC.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            if (matchStats.round % 5 === 0) {
                                myStatsC.atk = 0;
                                myStatsC.md = 0;
                                myStatsC.br = 0;
                            };

                            return AbilityResponse.SUCCESS;
                        }, 9999));
                        break;
                    //Removes shield at the start of the round and reduces max HP by 8%
                    case "exposed":
                        myStatsC.shield = 0;
                        myStatsC.maxhp -= Math.floor(myStatsC.maxhp * 0.08);
                        break;
                    default:
                        break;
                };
            });
        };

        let ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary),
            );

        // If Enemy Died
        if (eStatsC.hp < 1) { // if (myStats.ep/eStats.ep >= 2) {
            const result = await matchResult("w");
            if (result) interaction.editReply({ embeds: [result] });
            return;
        };

        // Fight Duration
        let fightDuration = 180;


        const threatLevelWarning = `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n`;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} ‖ round 1 ‖ time left: ${fightDuration}s` })
                    .setTitle(`Liminal Stage ${level + 1} (Level ${runData ? runData.level + 1 : 1})`)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(eStatsC.image);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };

                    // Use passives
                    // if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} ‖ round ${matchStats.round} ‖ time left: ${fightDuration + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        // await msg.edit({ embeds: [Embed] });

                        // Debounce
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            msg.edit({ embeds: [Embed] });
                        }, 600);
                    };

                    function minionDefeated(side: "my" | "enemy") {
                        if (side === "my") {
                            myStatsC = { ...matchStats.myStatsCC } as DetailedStats;
                            matchStats.currentCharacter = 0;
                            Embed.setThumbnail(myStatsC.thumbnail);
                            startNextRound();
                        } else {
                            eStatsC = { ...matchStats.eStatsCC };
                            matchStats.currentOpponent = 0;
                            Embed.setImage(eStatsC.image);
                            attack();
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                        if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost\nঌ❤︎໒꒱ـــــــــــــــــﮩ٨ــــــ`);
                        else notice.push(`\n🎉 **${myChar.name}** won\nঌ❤︎໒꒱ﮩ٨ـﮩﮩ٨ـ♡ﮩ٨ـﮩﮩ٨ـﮩ٨ـﮩﮩ٨`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };


                    function startNextRound() {
                        if (matchStats.ended) return;
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;


                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                        if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                        // Remove HP debuffs
                        eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                        // Apply Buffs
                        if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                        if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                        // Fix Stats
                        if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                        else if (myStatsC.hp < 0) myStatsC.hp = 0;
                        else myStatsC.hp = Math.floor(myStatsC.hp);
                        if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                        else if (eStatsC.hp < 0) eStatsC.hp = 0;
                        else eStatsC.hp = Math.floor(eStatsC.hp);

                        // Check and run delayed buffs
                        if (matchStats.currentCharacter === 0) {
                            for (let i = myStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                if (myStatsC.delayedBuffs[i].round <= matchStats.round) {
                                    myStatsC.delayedBuffs[i].run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    if (myStatsC.delayedBuffs[i].last <= 1 || myStatsC.delayedBuffs[i].used >= myStatsC.delayedBuffs[i].usage) {
                                        myStatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        myStatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                        };

                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                    };

                    let forcedSkillUse = 0;
                    function attack() {
                        if (matchStats.turn === 1) return;
                        if (eStatsC.timeFrozen) {
                            if (eStatsC.frozenMessage) notice.push(`\n✨ **${enemy.name}** ${eStatsC.frozenMessage}.`);
                            if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                            matchStats.turn = 1;
                            matchStats.round++;
                            startNextRound();
                            editEmbed();
                            if (matchStats.playerPausingRounds > 0) {
                                matchStats.playerPausingRounds--;
                                attack();
                            };
                        } else {
                            setTimeout(() => {
                                if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && Math.random() < 0.3) {
                                    // curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    // eStatsC.sm -= curse.cost;
                                    // editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if ((eStatsC.forceUseSkillOnRound === matchStats.round && forcedSkillUse++ === 0) || ("forceUseSkillOnRound" in eStatsC ? false : (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5))) {
                                    if (eAbility) {
                                        eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        eStatsC.sm -= eAbility.cost;
                                    };
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else {
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    matchStats.trigger("ATK", eStatsC, myStatsC, eBuffs, buffs);
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    if (matchStats.playerPausingRounds > 0) {
                                        matchStats.playerPausingRounds--;
                                        attack();
                                    };
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, aDelay);
                        };
                    };

                    // Write passive actions if any
                    if (notice.length > 4) {
                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        editEmbed();
                    };

                    atk.on('collect', async () => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            matchStats.actionSequence.push("ATK");
                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, canTwinshot: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                attack();

                                // if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                //     dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                //     editEmbed();
                                //     Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                //     attack();
                                // }, aDelay);

                                // else attack();
                            };

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    def.on('collect', async () => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            matchStats.actionSequence.push("DEF");

                            // If defense was replaced
                            if (myStatsC.replaceButton.def?.run) {
                                myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Use defense
                            else {
                                if (++matchStats.defUsed === 10) interaction.followUp({ content: `You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`, ephemeral: true });
                                if (matchStats.defUsed > 10) {
                                    notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
                                } else {
                                    let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats.defUsed - 1) * 5);
                                    let addmr = Math.floor((myClass ? 60 * myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((matchStats.defUsed - 1) * 5);
                                    buffs.def.push(new buffInfo("+", adddef, 9999));
                                    buffs.mr.push(new buffInfo("+", addmr, 9999));
                                    myStatsC.def += adddef;
                                    myStatsC.mr += addmr;
                                    notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                };
                                myStatsC.usedBlockRound = matchStats.round;

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    ability.on('collect', async () => {
                        if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            matchStats.actionSequence.push("ABILITY");

                            const response = await myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            attack();
                        }

                        else {
                            if (!myAbility?.ability) return interaction.followUp({ content: `You don't have an ability`, ephemeral: true });
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1 && !myStatsC.timeFrozen) {
                                    if (myAbility.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                    else {
                                        matchStats.turn = 0;
                                        myStatsC.attackStreak = 0;
                                        matchStats.actionSequence.push("ABILITY");
                                        myAbility.used++;

                                        const response = await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                        myStatsC.sm -= myAbility.cost;

                                        // Event Triggers
                                        if (response === AbilityResponse.SUCCESS) {
                                            matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                                        };

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    });

                    cskill.on('collect', async () => {
                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            matchStats.actionSequence.push("SKILL");
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            if (matchStats.turn === 0) attack();
                        }

                        // Class active
                        else {
                            if (!skill) return interaction.followUp({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    matchStats.actionSequence.push("SKILL");
                                    const response = await skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                    };

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        };
                    });

                    skip.on('collect', () => {
                        if (matchStats.turn == 1) {
                            matchStats.actionSequence.push("SKIP");


                            notice.push(`\n<:dodge_chance:1047269150948606063> ${myChar.name} fled the fight`);
                            endMatch("l");
                            editEmbed();
                        } else {
                            interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                        };
                    });

                    atk.on('end', () => {
                        if (fightDuration + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                            atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                            if (resolved) return;

                            resolve(matchResult("l"));
                        };
                    });

                });

            });
            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] });
        };

        newFight();
    },
};

export default exportCommand;
