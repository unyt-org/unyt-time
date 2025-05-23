import { StorageSet } from "datex-core-legacy/types/storage-set.ts";
import { trackerStorage } from "./Tracker.eternal.ts";
import { TimeEntry, TimeTracker } from "common/types.ts";
import { MatchCondition } from "datex-core-legacy/datex_all.ts";



export class Tracker {
	static async get(id: string): Promise<TimeTracker> {
		if(!await trackerStorage.has(id)) {
			await trackerStorage.set(id, TimeTracker({
				title: id,
				// entries: StorageSet.of(TimeEntry) as unknown as StorageSet<TimeEntry>
				entries: new StorageSet<TimeEntry>()
			}));
		}
		return (await trackerStorage.get(id))!;
	}

	static async getEntries(id: string): Promise<Set<TimeEntry>> {
		const tracker = await this.get(id);
		
		return asyncAlways (async() => {
			const trackerEntriesArray = await tracker.entries.valuesArray();
			
			return new Set(trackerEntriesArray.toSorted((a,b) => b.startTime - a.startTime));
		})

	}

	static async getEntriesByDate(id: string, date: Ref<number>): Promise<Set<TimeEntry>> {
		const tracker = await this.get(id);
       
		return asyncAlways (async() => {
			const startOfDay = new Date(date);
			const endOfDay = new Date(date);
	
			startOfDay.setUTCHours(0,0,0,0);
			endOfDay.setUTCHours(23, 59, 59, 999);
	
			console.log(startOfDay);
			console.log(endOfDay);
			const filtered = await tracker.entries.match({
				startTime: MatchCondition.between(startOfDay.getTime(), endOfDay.getTime())
			},
			{ sortBy: "startTime"},
			TimeEntry
		);
			return filtered;
		})
		
	}


	static async addEntry(id: string, entry: TimeEntry) {
		const tracker = await this.get(id);
		await tracker.entries.add(entry);
	}

	static async deleteEntry(id: string, entry: TimeEntry) {
		const tracker = await this.get(id);
		await tracker.entries.delete(entry);
	}

	static async updateEntry(id: string, entry: TimeEntry) {
		const tracker = await this.get(id);
		const entriesArray = await tracker.entries.valuesArray();
		const existingEntry = entriesArray.find(e => 
			e.task === entry.task && 
			e.startTime === entry.startTime
		);
		if (!existingEntry) {
			throw new Error("Entry does not belong to this tracker");
		}
		existingEntry.endTime = Date.now();
	}

	// static async getRunningEntry(id: string): Promise<TimeEntry | undefined> {
	// 	const tracker = await this.get(id);
	// 	const entries = await tracker.entries.valuesArray();
	// 	return entries.find(e => !e.endTime || e.endTime === 0);
	// }

	static async isRunningEntry(id: string): Promise<boolean> {
		const tracker = await this.get(id);
		const entries = await tracker.entries.valuesArray();
		const isRunning = entries.find(e => !e.endTime || e.endTime === 0) != null;

		return isRunning;
	}

	static async stopEntry(id: string) {
        const tracker = await this.get(id);
        const entriesArray = await tracker.entries.valuesArray();
        const runningEntry = entriesArray.find(e => !e.endTime || e.endTime === 0);
        
        if (!runningEntry) {
            throw new Error("No running timer found");
        }
        
        runningEntry.endTime = Date.now();
    }
	
	static createTimeEntry(entry: TimeEntry) {
		const newEntry: TimeEntry = TimeEntry({
			...entry
		});
		return newEntry
	}

	private getDuration(entry: TimeEntry) {
		return entry.endTime && entry.endTime > 0
			? entry.endTime - entry.startTime
			: Date.now() - entry.startTime;
	}
	
}
