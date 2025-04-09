import { inferType, StorageSet } from "datex-core-legacy/datex_all.ts";


export const TimeEntry = struct("TimeEntry",{
	task: string,
	startTime: number,
	endTime: number,
	tags: Array<string>,
	
})
export type TimeEntry = inferType<typeof TimeEntry>

export const TimeTracker = struct("TimeTracker", {
	
	title: string,
	entries: StorageSet<TimeEntry>
})
export type TimeTracker = inferType<typeof TimeTracker>