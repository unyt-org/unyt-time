import { template } from "uix/html/template.ts";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry } from "common/types.ts";
import { Component } from "uix/components/Component.ts";
 
@template(async function({identifier}) {
	const filterDate = $(Date.now()); 
	this.entries = await Tracker.getEntriesByDate(identifier, filterDate);

	console.log(this.entries);
	console.log(id);
	return <div class="max-w-screen min-h-screen mx-auto p-8 font-sans text-gray-200 bg-gray-800 bg-opacity-80 shadow-lg border border-gray-700">
    <h1 class="text-3xl text-center text-blue-400 mb-8 font-bold text-shadow">Time Tracker</h1>
	<div class="flex gap-4 mb-6 justify-center">
		<button type="button" onclick:frontend={() => this.startNewTimer()}
			class="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow transition duration-200"
			disabled={this.hasActiveTimer}>
				Start New Timer
		</button>
		<button type="button" onclick:frontend={() => this.stopCurrentTimer()}
			class="px-5 py-2 bg-red-500 hover:bg-red-900 text-white rounded-xl shadow transition duration-200"
			disabled={!this.hasActiveTimer}>
				Stop Current Timer
		</button>

		<button type="button" onclick:frontend={() => this.addManualEntry()}
			class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition duration-200">
				Add Manual Entry
		</button>
	</div>
	<div class="text-center text-xl py-4 px-6 mb-6 bg-gray-700 rounded-lg border border-gray-600 font-bold text-blue-400">
		{this.hasActiveTimer ? "Tracking time..." : "Not running"}
	</div>
	
	<div class="bg-gray-700 p-3 rounded-lg shadow">
		<span> 
		<input 
			type="date" 
			placeholder="YYYY-MM-DD"
			pattern="\d{4}-\d{2}-\d{2}"
			value={filterDate}
		/>
		
	 	</span>
		<div class="bg-grey-700 space-y-3">
			{
				[...this.entries].map((entry) => (
					<div class="bg-gray-800 hover:bg-gray-600 rounded-2xl">
						<div>
							<input 
								type="text"
								class="text-blue-400 hover:text-blue-200"
								value={entry.task}			
							/>
							<button type="button" onclick:frontend={() => this.removeEntry(entry)}
							class="px-3 py-1 bg-red-500 hover:bg-red-300 rounded text-sm">
								Delete
							</button>
						</div>
						
						<span class="text-gray-300 ml-2 whitespace-nowrap">
                            {new Date(entry.startTime).toLocaleString()}
                            {entry.endTime && ` - ${new Date(entry.endTime).toLocaleString()}`}
                        </span>	
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
	
	private async addManualEntry() {
		const taskName = prompt("Enter task name:");
		if (taskName === null) return;
		const startTime = prompt("Enter start time (YYYY-MM-DD HH:MM):");
		if (startTime === null) return;
		const endTime = prompt("Enter end time (YYYY-MM-DD HH:MM):");
		if (endTime === null) return;
		const anyTags = prompt("Enter tags (comma separated):");
		if (anyTags === null) return;

		const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
			task: taskName,
			startTime: startTime ? new Date(startTime).getTime() : Date.now(),
			endTime: endTime ? new Date(endTime).getTime() : Date.now(),
			tags: anyTags ? anyTags.split(',').map(tag => tag.trim()) : []
		}));
		await Tracker.addEntry(this.properties.identifier, newEntry);
	}

	private async startNewTimer() {
		if (this.hasActiveTimer) {
            alert("A Timer is already running.");
            return;
        }
		const taskName = prompt("Enter task name:") || "Untitled Task";
		if (taskName === null) return;
		const anyTags = prompt("Enter Tag (comma separated):");
		if (anyTags === null) return;
		
		
		const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
			task: taskName,
			startTime: Date.now(),
			endTime: 0,
			tags: anyTags ? anyTags.split(',').map(tag => tag.trim()) : []
		}));

		this.hasActiveTimer = true;
		try {
			await Tracker.addEntry(this.properties.identifier, newEntry)
		} catch(e) {
			return e;
		}
	}

	private async stopCurrentTimer() {
		try {
			await Tracker.stopEntry(this.properties.identifier);
			this.hasActiveTimer = false;
		} catch (e) {
		console.error("Error stopping entry:", e);
		}
	}

	private async removeEntry(entry: TimeEntry) {
		if (!confirm("Are you sure you want to remove this entry?")) return;
    
		try {
			await Tracker.deleteEntry(this.properties.identifier, entry)
		} catch (e) {
			console.error("Error removing entry:", e);
		}
	}	
	
	
}
