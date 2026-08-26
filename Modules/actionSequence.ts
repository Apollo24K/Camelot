export type ActionSequenceAction = "atk" | "def" | "ability" | "skill" | "skip";

export const ACTION_SEQUENCE_ERROR_MESSAGE = "Error in action sequence. Please use the format `atk:3,def,ability,skill,skip` or `(atk,def):3` for patterns.\n**Restrictions**: Max 5000 actions, max 200 repeats, max 5 nesting levels, max 50 iterations";
export const ACTION_SEQUENCE_IN_PROGRESS_MESSAGE = "Please wait until the action sequence is finished";

const actionMapping: Record<ActionSequenceAction, string[]> = {
    atk: ["1", "atk", "attack", "a"],
    def: ["2", "def", "defense", "d"],
    ability: ["3", "ability", "abil", "ab"],
    skill: ["4", "skill", "sk", "s", "class", "cl", "c"],
    skip: ["5", "skip", "flee", "escape", "esc"],
};

const MAX_SEQUENCE_LENGTH = 5000;
const MAX_REPEAT_COUNT = 200;
const MAX_NESTING_DEPTH = 5;
const MAX_EXPANSION_ITERATIONS = 50;

function expandParentheses(input: string): string | null {
    let result = input;
    let changed = true;
    let iterations = 0;
    let currentDepth = 0;
    let maxDepth = 0;

    for (const char of input) {
        if (char === "(") {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
        } else if (char === ")") {
            currentDepth--;
            if (currentDepth < 0) return null;
        }
    }
    if (currentDepth !== 0 || maxDepth > MAX_NESTING_DEPTH) return null;

    while (changed && iterations < MAX_EXPANSION_ITERATIONS) {
        changed = false;
        iterations++;

        result = result.replace(/\(([^()]+)\):(\d+)/g, (match, content: string, countString: string) => {
            const count = parseInt(countString);
            if (isNaN(count) || count <= 0 || count > MAX_REPEAT_COUNT) return match;

            const contentItems = content.split(",").length;
            const resultItems = result.split(",").length;
            if (resultItems + (contentItems * count) > MAX_SEQUENCE_LENGTH) return match;

            changed = true;
            return Array(count).fill(content).join(",");
        });

        result = result.replace(/\(([^()]+)\)(?!:)/g, (_match, content: string) => {
            changed = true;
            return content;
        });

        if (result.split(",").length > MAX_SEQUENCE_LENGTH) return null;
    }

    if (iterations >= MAX_EXPANSION_ITERATIONS || result.includes("(") || result.includes(")")) return null;
    return result;
}

function getAction(input: string): ActionSequenceAction | null {
    for (const [action, aliases] of Object.entries(actionMapping) as [ActionSequenceAction, string[]][]) {
        if (aliases.includes(input)) return action;
    }
    return null;
}

export function parseActionSequence(input: string | null): ActionSequenceAction[] | null {
    if (!input) return [];

    const expandedSequence = expandParentheses(input);
    if (expandedSequence === null) return null;

    const actions: ActionSequenceAction[] = [];
    for (const entry of expandedSequence.split(",")) {
        const trimmed = entry.trim().toLowerCase();
        const parts = trimmed.split(":");
        if (parts.length > 2) return null;

        const action = getAction(parts[0]);
        if (!action) return null;

        const count = parts.length === 1 ? 1 : Number(parts[1]);
        if (!Number.isInteger(count) || count <= 0 || count > MAX_REPEAT_COUNT) return null;
        if (actions.length + count > MAX_SEQUENCE_LENGTH) return null;

        actions.push(...Array<ActionSequenceAction>(count).fill(action));
    }

    return actions;
}

type ActionHandlers = Record<ActionSequenceAction, () => void | Promise<void>>;

export async function applyActionSequence(
    sequence: ActionSequenceAction[],
    handlers: ActionHandlers,
    canContinue: () => boolean,
): Promise<void> {
    while (sequence.length > 0 && canContinue()) {
        const action = sequence.shift();
        if (!action) return;
        await handlers[action]();
    }
}
