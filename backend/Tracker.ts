import { StorageSet } from "datex-core-legacy/types/storage-set.ts";
import { trackerStorage } from "./Tracker.eternal.ts";
import { TimeEntry, TimeTracker } from "common/types.ts";

export class Tracker {
	static async get(id: string): Promise<TimeTracker> {
		if(!await trackerStorage.has(id)) {
			await trackerStorage.set(id, TimeTracker({
				title: id,
				entries: StorageSet.of(TimeEntry) as unknown as StorageSet<TimeEntry>
			}));
		}
		return (await trackerStorage.get(id))!;
	}

	static async getEntries(id: string): Promise<Set<TimeEntry>> {
		const tracker = await this.get(id);
		const trackerEntriesArray = await tracker.entries.valuesArray();

		return new Set(trackerEntriesArray);

	}

	static async addEntry(id: string, entry: TimeEntry) {
		const tracker = await this.get(id);
		await tracker.entries.add(entry);
	}
}
