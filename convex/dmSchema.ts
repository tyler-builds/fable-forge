export const dndDmSchema = {
    name: "dnd_dm_response",
    schema: {
        type: "object",
        properties: {
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
            proactiveEvent: { type: "string" },
            eventOptions: { type: "array", items: { type: "string" } }
        },
        required: ["outcome"]
    }
};
