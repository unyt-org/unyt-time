export const identifiers = [
    "marvin",
    "jonas",
	"benni",

] as const;

export type Identifier = typeof identifiers[number];