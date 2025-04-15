// deno-lint-ignore-file
import { template } from "uix/html/template.ts";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry } from "common/types.ts";
import { Component } from "uix/components/Component.ts";
// import { Context } from "uix/routing/context.ts";

 
@template(async function({identifier}) {
	const filterDate = $(Date.now()); 
	this.entries = await Tracker.getEntriesByDate(identifier, filterDate);
	// this.entries = await Tracker.getEntries(identifier);
	this.hasActiveTimer = await Tracker.isRunningEntry(identifier);

	return <div class="max-w-screen min-h-screen mx-auto p-8 font-sans text-gray-200 bg-gray-800 bg-opacity-80 shadow-lg border border-gray-700">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>
	<h1 class="text-3xl text-center text-blue-400 mb-8 font-bold text-shadow">Time Tracker</h1>
	<button
		type="button"
		onclick:frontend={() => this.logout()}
		class="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-900 text-white rounded-lg shadow transition"
	>
		<i class="fas fa-sign-out-alt"></i> Logout
	</button>

	{/* ------------------popover--------------- */}
	<div popover="manual" id="timer-popover" class="fixed inset-0 m-auto w-96 h-80 p-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600">
		<h2 class="text-xl font-bold text-blue-400 mb-4">New Timer</h2>
		
		<div class="mb-4">
			<label for="task-input" class="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
			<input id="task-input" type="text" 
				class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
				// value={this.taskName}
				oninput:frontend={(e: Event) => 
					{
						this.taskName = (e.target as HTMLInputElement).value
					}}
				placeholder="Untitled Task" />
		</div>
		
		<div class="mb-6">
			<label for="tags-input" class="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
			<input id="tags-input" type="text" 
				class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
				// value={this.tagsInput}
				oninput:frontend={(e: Event) => this.tagsInput = (e.target as HTMLInputElement).value}
				placeholder="tag1, tag2, ..." />
		</div>
		
		<div class="flex justify-end gap-2">
			<button type="button" onclick:frontend={() => (document.getElementById('timer-popover') as HTMLDivElement)?.hidePopover()}
				class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
				Cancel
			</button>
			<button type="button" onclick:frontend={() => this.confirmStartTimer()}
				class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
				Start
			</button>
		</div>
	</div>
  {/* -----------popover - manual------------- */}
  <div popover="manual" id="manual-popover" class="fixed inset-0 m-auto w-96 p-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 backdrop-filter: blur(3px)">
            <h2 class="text-xl font-bold text-blue-400 mb-4">Add Manual Entry</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
                    <input type="text" 
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        // value={this.manualEntry.taskName}
                        oninput:frontend={(e) => this.manualEntry.taskName = (e.target as HTMLInputElement).value}
                        placeholder="Task name" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                        <input type="datetime-local" 
                            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                            // value={this.manualEntry.startTime}
                            oninput:frontend={(e) => this.manualEntry.startTime = (e.target as HTMLInputElement).value} />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                        <input type="datetime-local" 
                            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                            // value={this.manualEntry.endTime}
                            oninput:frontend={(e) => this.manualEntry.endTime = (e.target as HTMLInputElement).value} />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                    <input type="text" 
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        // value={this.manualEntry.tags}
                        oninput:frontend={(e) => this.manualEntry.tags = (e.target as HTMLInputElement).value}
                        placeholder="tag1, tag2, ..." />
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
                <button type="button" 
                    onclick:frontend={() => (document.getElementById('manual-popover') as HTMLDivElement)?.hidePopover()}
                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
                    Cancel
                </button>
                <button type="button" 
                    onclick:frontend={() => this.confirmManualEntry()}
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                    Add Entry
                </button>
            </div>
        </div>
		{/* ---------------- */}
	<div class="flex gap-4 mb-6 justify-center">
		<button type="button" 
			popovertarget="timer-popover"
			class="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow transition duration-200 "
			disabled={this.hasActiveTimer}>
				<i class="fas fa-play"></i> Start New Timer
		</button>
		<button type="button" onclick:frontend={() => this.stopCurrentTimer()}
			class="px-5 py-2 bg-red-500 hover:bg-red-900 text-white rounded-xl shadow transition duration-200"
			disabled={!this.hasActiveTimer}>
				<i class="fas fa-stop"></i> Stop Current Timer
		</button>

		<button type="button" 
            popovertarget="manual-popover"
            class="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition duration-200">
            <i class="fas fa-plus-circle"></i> Add Manual Entry
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

							<div class="text-gray-400 ml-2 text-sm">
								Duration: {
									entry.endTime && entry.endTime > 0 
									? this.formatDuration(entry.endTime - entry.startTime) 
									: always(this.formatDuration(Date.now() - entry.startTime))
								}
							</div>

							<button type="button" onclick:frontend={() => this.removeEntry(entry)}
							class="px-3 py-1 bg-red-500 hover:bg-red-300 rounded text-sm">
								<i class="fas fa-trash-alt"></i> Delete
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
	hasActiveTimer!: boolean

	@property
	taskName = "";

	@property
	tagsInput = "";

	@property
    manualEntry = {
        taskName: "",
        startTime: "",
        endTime: "",
        tags: ""
    };

	@property private updateInterval?: number;

	private async logout() {
		// try {
		// 	const sharedData = await Context.getSharedData();
		// 	delete sharedData.identifier;
		// location.href = "/";
        localStorage.removeItem("identifier");
        location.href = "/"; 

		// } catch (e) {
		// 	console.error("Error during logout:", e);
		// 	location.href = "/";
		// }
    }

	private setupAutoUpdate() {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
		}
	
		if (this.hasActiveTimer) {
			this.updateInterval = setInterval(() => {
				const updatedEntries = new Set<TimeEntry>();
				this.entries.forEach(entry => {
					if (!entry.endTime || entry.endTime === 0) {
						const updatedEntry = { ...entry };
						updatedEntries.add(updatedEntry);
					} else {
						updatedEntries.add(entry);
					}
				});
				this.entries = updatedEntries;
			}, 1000) as unknown as number;
		}
	
		window.addEventListener('unload', () => {
			if (this.updateInterval) {
				clearInterval(this.updateInterval);
			}
		});
	}


	private formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000) % 60;
		const minutes = Math.floor(ms / 1000 / 60) % 60;
		const hours = Math.floor(ms / 1000 / 60 / 60);
	
		return `${hours}h ${minutes}m ${seconds}s`;
	}

	private async confirmStartTimer() {
        if (this.hasActiveTimer) {
            alert("A Timer is already running.");
            return;
        }

        const taskName = (this.taskName ?? "").trim() || "Untitled Task";
        const tags = (this.tagsInput ?? "") ? 
            this.tagsInput.split(',').map(tag => tag.trim()) : [];

        const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
            task: taskName,
            startTime: Date.now(),
            endTime: 0,
            tags: tags
        }));

        this.hasActiveTimer = true;
        (document.getElementById('timer-popover') as HTMLDivElement)?.hidePopover();
        
        if (this.taskName) {
			this.taskName = "";
		}
        if (this.tagsInput) {
			this.tagsInput = "";
		}

        try {
            await Tracker.addEntry(this.properties.identifier, newEntry);
			this.setupAutoUpdate();
        } catch(e) {
            console.error("Error adding entry:", e);
        }
    }

	private async confirmManualEntry() {
        if (!this.manualEntry.taskName.trim()) {
            alert("Please enter a task name");
            return;
        }

        if (!this.manualEntry.startTime || !this.manualEntry.endTime) {
            alert("Please enter both start and end times");
            return;
        }

        const startDate = new Date(this.manualEntry.startTime);
        const endDate = new Date(this.manualEntry.endTime);

        if (startDate >= endDate) {
            alert("Start time must be before end time");
            return;
        }

        try {
            const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
                task: this.manualEntry.taskName,
                startTime: startDate.getTime(),
                endTime: endDate.getTime(),
                tags: this.manualEntry.tags ? this.manualEntry.tags.split(',').map(tag => tag.trim()) : []
            }));

            await Tracker.addEntry(this.properties.identifier, newEntry);
            
            this.manualEntry = {
                taskName: "",
                startTime: "",
                endTime: "",
                tags: ""
            };
            (document.getElementById('manual-popover') as HTMLDivElement)?.hidePopover();
            
        } catch (e) {
            console.error("Error adding manual entry:", e);
            alert("Failed to add entry. Please try again.");
        }
    }

	private async stopCurrentTimer() {
		try {
			await Tracker.stopEntry(this.properties.identifier);
			this.hasActiveTimer = false;
			this.entries = await Tracker.getEntriesByDate(this.properties.identifier, $(Date.now()));
			if (this.updateInterval) {
				clearInterval(this.updateInterval);
				this.updateInterval = undefined;
			}
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
