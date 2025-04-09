import { StorageSet } from "datex-core-legacy/types/storage-set.ts";
import { trackerStorage } from "./Tracker.eternal.ts";
import { TimeEntry, TimeTracker } from "common/types.ts";


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
		const trackerEntriesArray = await tracker.entries.valuesArray();

		return new Set(trackerEntriesArray.toSorted((a,b) => b.startTime - a.startTime));
		
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

	static async getRunningEntry(id: string): Promise<TimeEntry | undefined> {
		const tracker = await this.get(id);
		const entries = await tracker.entries.valuesArray();
		return entries.find(e => !e.endTime || e.endTime === 0);
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
	
}
