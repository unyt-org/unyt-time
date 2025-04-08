import { inferType, StorageSet } from "datex-core-legacy/datex_all.ts";

export const TimeEntry = struct({
	task: string,
	startTime: Date,
	endTime: Date,
	tags: Array<string>,
})
export type TimeEntry = inferType<typeof TimeEntry>

export const TimeTracker = struct({
	title: string,
	entries: StorageSet<TimeEntry>
})
export type TimeTracker = inferType<typeof TimeTracker>