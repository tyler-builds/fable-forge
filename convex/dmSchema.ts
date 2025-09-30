export function getDndDmSchema(includeEvents: boolean = false) {
    const baseProperties = {
        outcome: { type: "string" },
        glossaryTerms: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    term: { type: "string" },
                    definition: { type: "string" }
                },
                required: ["term", "definition"]
            }
        },
        inventoryChanges: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    quantityChange: { type: "integer" },
                    description: { type: "string" },
                    reason: { type: "string" }
                },
                required: ["name", "quantityChange"]
            }
        },
        statAdjustment: { type: "boolean" },
        statToAdjust: { type: "string", enum: ["hp", "mp", "str", "dex", "con", "int", "wis", "cha"] },
        adjustmentAmount: { type: "integer" },
        sceneDescription: { type: "string" }
    };

    // Only add event-related properties if we want events
    const properties = includeEvents 
        ? {
            ...baseProperties,
            proactiveEvent: { type: "string" },
            eventOptions: { type: "array", items: { type: "string" } }
          }
        : baseProperties;

    return {
        name: "dnd_dm_response",
        schema: {
            type: "object",
            properties,
            required: ["outcome"]
        }
    };
}

// Keep the old export for backward compatibility in case anything else uses it
export const dndDmSchema = getDndDmSchema(true);
