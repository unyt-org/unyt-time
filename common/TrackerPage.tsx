import { template } from "uix/html/template.ts";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry, TimeTracker } from "common/types.ts";
import { Component } from "uix/components/Component.ts";
 
// await Tracker.addEntry("2", TimeEntry({task:"homework", startTime:Date.now(), endTime:0, tags:["homework"]}))
// console.log(await Tracker.getEntries("2"));

@template(async function({identifier}) {
	this.entries = await Tracker.getEntries(identifier);
	console.log(this.entries);
	console.log(id);
	return <div class="bg-amber-50">
    <h1 class="text-2xl font-bold text-black">Time Tracker</h1>
	<div class="flex gap-4 my-4">
		<button onclick:frontend={() => this.startNewTimer()}
			class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow transition duration-200"
			disabled={this.hasActiveTimer}>
				Start New Timer
		</button>
		<button onclick:frontend={() => this.stopCurrentTimer()}
			class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow transition duration-200"
			disabled={!this.hasActiveTimer}>
				Stop Current Timer
		</button>
	</div>
	<div class="">
        {always(() => this.hasActiveTimer ? "Tracking time..." : "Not running")}
	</div>
	<div class="bg-amber-50 p-3 rounded-lg shadow">
		<div class="">
			{
				[...this.entries].map((entry) => (
					<div>
						{entry.task} - {new Date(entry.startTime).toLocaleTimeString()}
						{entry.endTime && ` - ${new Date(entry.endTime).toLocaleTimeString()}`}

						<button onclick:frontend={() => this.removeEntry(entry)}
						class="px-3 py-1 bg-red-500 hover:bg-red-300 rounded text-sm">
							Delete
						</button>
					</div>
					
				))  
			}
			
		</div>
	</div>
	</div>
})
export class TrackPage extends Component<{
	identifier: string;
}> {
	@property
	entries!: Set<TimeEntry>

	@property
	hasActiveTimer = false;
	
	private async startNewTimer() {
		if (this.hasActiveTimer) {
            alert("A Timer is already running.");
            return;
        }
		const taskName = prompt("Enter task name:") || "Untitled Task";
		const anyTags = prompt("Enter Tag (comma separated):");

		const newEntry: TimeEntry = TimeEntry({
			task: taskName,
			startTime: Date.now(),
			endTime: 0,
			tags: anyTags ? anyTags.split(',').map(tag => tag.trim()) : []
		});
		this.hasActiveTimer = true;
		try {
			await Tracker.addEntry(this.properties.identifier, newEntry)
			this.entries = await Tracker.getEntries(this.properties.identifier);
		} catch(e) {
			return e;
		}
	}

	private async stopCurrentTimer() {
		try {
			await Tracker.stopEntry(this.properties.identifier);
        	this.entries = await Tracker.getEntries(this.properties.identifier);
			this.hasActiveTimer = false;
		} catch (e) {
		console.error("Error stopping entry:", e);
		}
	}

	private async removeEntry(entry: TimeEntry) {
		if (!confirm("Are you sure you want to remove this entry?")) return;
    
		try {
			await Tracker.deleteEntry(this.properties.identifier, entry)
			this.entries = await Tracker.getEntries(this.properties.identifier);
		} catch (e) {
			console.error("Error removing entry:", e);
		}
	}			  
}
