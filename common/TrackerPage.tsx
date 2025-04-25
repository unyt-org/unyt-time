// deno-lint-ignore-file
import { template } from "uix/html/template.ts";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry } from "common/types.ts";
import { Component } from "uix/components/Component.ts";
import { formatDuration, calculateTotalDuration, getTotalDurationForSelectedDay } from "common/components/timeUtils.ts" 

@template(async function({identifier}) {
	const filterDate = this.filterDate;
	// this.entries = await Tracker.getEntriesByDate(identifier, filterDate);
	// this.hasActiveTimer = await Tracker.isRunningEntry(identifier);
	// this.last7Days = await this.getLast7Days(identifier);
	[this.entries, this.hasActiveTimer, this.last7Days] = await Promise.all([
		Tracker.getEntriesByDate(identifier, filterDate),
		Tracker.isRunningEntry(identifier),
		this.getLast7Days(identifier)
	]);

	

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

	{/* Popover */}
	<div popover="auto" id="timer-popover" class="fixed inset-0 m-auto w-100 h-100 overflow-hidden p-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600">
		<h2 class="text-xl font-bold text-blue-400 mb-4">New Timer</h2>
		
		<div class="mb-4">
			<label for="task-input" name="task" class="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
			<input id="task-input" type="text" 
				class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
				value={this.taskName}
				placeholder="Untitled Task" />
		</div>
		
		<div class="mb-6">
			<label for="tags-input" class="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
			<input id="tags-input" type="text" 
				class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
				value={this.tagsInput}
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
  {/* Popover - manual-Entry */}
  <div popover="auto" id="manual-popover" class="fixed inset-0 m-auto w-96 p-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600">
            <h2 class="text-xl font-bold text-blue-400 mb-4">Add Manual Entry</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
                    <input type="text" name="task-manual" 
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        value={this.manualEntry.taskName}
                        placeholder="Task name" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                        <input type="datetime-local" name="start-timer"
                            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                            value={this.manualEntry.startTime} />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                        <input type="datetime-local" name="end-timer"
                            class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                           value={this.manualEntry.endTime}/>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Tags (comma separated)</label>
                    <input type="text" name="tags"
                        class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                        value={this.manualEntry.tags}
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
		{/* Popover-Blocker */}
		<div id="blocker" class="popover-blocker"></div>
		{/* Buttons */}
	<div class="flex gap-4 mb-6 justify-center">
		<button type="button" 
			popovertarget="timer-popover"
			class="px-5 py-2 rounded-xl bg-green-600 text-white "
			disabled={this.hasActiveTimer}>
				<i class="fas fa-play"></i> Start New Timer
		</button>
		<button type="button" onclick:frontend={() => this.stopCurrentTimer()}
			class="px-5 py-2 rounded-xl bg-red-700 text-white "
			disabled={!this.hasActiveTimer}>
				<i class="fas fa-stop"></i> Stop Current Timer
		</button>

		<button type="button" 
            popovertarget="manual-popover"
            class="px-5 py-2 rounded-xl bg-blue-600 text-white ">
            <i class="fas fa-plus-circle"></i> Add Manual Entry
        </button>
	</div>
	<div class="text-center text-xl py-4 px-6 mb-6 bg-gray-700 rounded-lg border border-gray-600 font-semibold text-blue-300 shadow-inner">
		{this.hasActiveTimer ? "Tracking time..." : "Not running"}
	</div>
	{/* History-Section */}
	<div class="bg-gray-700 p-3 rounded-lg shadow mb-6">
        <h3 class="text-lg font-medium mb-2">History</h3>
        <div class="flex items-center gap-2">
            <input 
                type="date" 
                class="bg-gray-600 p-2 rounded"
                max={new Date().toISOString().split('T')[0]}
                onchange:frontend={(e) => {
                    const dateStr = (e.target as HTMLInputElement).value;
                    if (dateStr) {
                        location.href = `/history/${dateStr}`;
                    }
                }}
            />
            <span class="text-sm text-gray-400">View detailed history</span>
        </div>
    </div>
	{/* 7day-Active-Filter */}
	<div class="grid grid-cols-1 md:grid-cols-7 gap-3 mb-6">
            {this.last7Days.map((day) => (
                <div onclick:frontend={() => this.filterByDate(day.date)} class={`p-3 rounded-lg cursor-pointer transition-colors ${
                    day.date === this.selectedDate 
                        ? 'bg-blue-600' 
                        : day.isToday 
                            ? 'bg-gray-700 border border-blue-400' 
                            : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                    <div class="text-center font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div class="text-center text-sm mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div class="text-center text-xs">
                        {formatDuration(day.totalDuration)}
                    </div>
                </div>
            ))}
        </div>
		{/* Entries */}
		<div class="bg-gray-700 p-3 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">
                {new Date(this.filterDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
                })}
            </h2>
            
            <div class="space-y-3">
			{
				[...this.entries].reverse().map((entry) => (
					<div class="bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-4 shadow-md border border-gray-600 mb-3">
						<div class="flex justify-between items-start mb-2">
							<div class="flex-1">
								<input 
									type="text"
									class="bg-transparent text-lg font-semibold text-blue-400 focus:outline-none hover:text-blue-300"
									value={entry.task}			
								/>

								<div class="text-sm text-gray-400 mt-1">
									Duration: {
										entry.endTime && entry.endTime > 0 
										? formatDuration(entry.endTime - entry.startTime) 
										: formatDuration(Date.now() - entry.startTime)
									}
								</div>
							</div>
							<button type="button" onclick:frontend={() => this.removeEntry(entry)}
							class="ml-4 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-400 text-white rounded-lg transition">
								<i class="fas fa-trash-alt"></i> Delete
							</button>
						</div>
						
						<span class="text-sm text-gray-300">
                            {new Date(entry.startTime).toLocaleString()}
                            {entry.endTime && ` - ${new Date(entry.endTime).toLocaleString()}`}
                        </span>	
					</div>	
				))  
			}
            </div>
			{/* Total duration */}
			<div class="bg-gray-700 p-4 rounded-lg shadow mt-4">
				<div class="flex justify-between items-center">
					<span class="text-lg font-semibold">Total duration:</span>
					<span class="text-xl font-bold text-blue-400">
						{getTotalDurationForSelectedDay(this.entries)}
					</span>
				</div>
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
	filterDate = $(Date.now());

	@property
    private selectedDate = $(Date.now());

	@property
    manualEntry = {
        taskName: "",
        startTime: 0,
        endTime: 0,
        tags: ""
    };

	@property
    last7Days!: Array<{
        date: number;
        totalDuration: number;
        isToday: boolean;
    }>;

	private updateInterval?: number;

	private async logout() {
        localStorage.removeItem("identifier");
        location.href = "/"; 
    }

	private async getLast7Days(identifier: string) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		

		const dates = Array.from({length: 7}, (_, i) => {
			const date = new Date(today);
			date.setDate(date.getDate() - (6 - i)); 
			return date;
		});

		const entriesPromises = dates.map(date => 
			Tracker.getEntriesByDate(identifier, $(date.getTime()))
		);
		
		const allEntries = await Promise.all(entriesPromises);
		
		return dates.map((date, i) => {
			const entries = allEntries[i];
			return {
				date: date.getTime(),
				totalDuration: calculateTotalDuration(entries),
				isToday: i === 6 
			};
		});
	}


	private async filterByDate(date: number) {
        this.filterDate = $(date);
        this.selectedDate = $(date); 
        this.entries = await Tracker.getEntriesByDate(this.properties.identifier, this.filterDate);
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


	private async confirmStartTimer() {
        if (this.hasActiveTimer) {
            alert("A Timer is already running.");
            return;
        }

        const taskName = (this.taskName ?? "").trim() || "Untitled Task";
        const tags = (this.tagsInput ?? "") ? 
            this.tagsInput.split(',').map(tag => tag.trim()) : [];
		
        try {
			const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
				task: taskName,
				startTime: Date.now(),
				endTime: 0,
				tags: tags
			}));
	
			await Tracker.addEntry(this.properties.identifier, newEntry);

			this.hasActiveTimer = true;
			(document.getElementById('timer-popover') as HTMLDivElement)?.hidePopover();
			
			this.taskName = "";
            this.tagsInput = "";
            
            const taskInput = document.getElementById('task-input') as HTMLInputElement;
            const tagsInput = document.getElementById('tags-input') as HTMLInputElement;
            if (taskInput) {
                taskInput.value = "";
                taskInput.dispatchEvent(new Event('input'));
            }
            if (tagsInput) {
                tagsInput.value = "";
                tagsInput.dispatchEvent(new Event('input'));
            }

            
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

        const startDate = this.manualEntry.startTime;
        const endDate = this.manualEntry.endTime;

        if (startDate >= endDate) {
            alert("Start time must be before end time");
            return;
        }

        try {
            const newEntry: TimeEntry = await Tracker.createTimeEntry(TimeEntry({
                task: this.manualEntry.taskName,
                startTime: startDate,
                endTime: endDate,
                tags: this.manualEntry.tags ? this.manualEntry.tags.split(',').map(tag => tag.trim()) : []
            }));

            await Tracker.addEntry(this.properties.identifier, newEntry);
            
            this.manualEntry = {
                taskName: "",
                startTime: 0,
                endTime: 0,
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
