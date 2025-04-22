// deno-lint-ignore-file
import { template } from "uix/html/template.ts";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry } from "common/types.ts";
import { Component } from "uix/components/Component.ts";
import { getTotalDurationForSelectedDay } from "common/components/timeUtils.ts"


@template(async function({identifier, date}) {
    const dateObj = new Date(date);
    this.entries = await Tracker.getEntriesByDate(identifier, $(dateObj.getTime()));
	this.visibleEntries = 5; 
    this.hasMoreEntries = this.entries.size > this.visibleEntries;

    return <div class="max-w-screen min-h-screen mx-auto p-8 font-sans text-gray-200 bg-gray-800 bg-opacity-80 shadow-lg border border-gray-700">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>
        
        <h1 class="text-3xl text-center text-blue-400 mb-8 font-bold text-shadow">Time Tracker History</h1>
        
        <button onclick:frontend={() => history.back()}
            class="absolute top-4 left-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow transition">
            <i class="fas fa-arrow-left"></i> Back
        </button>

        <div class="bg-gray-700 p-3 rounded-lg shadow mb-6">
            <h2 class="text-xl font-semibold mb-4">
                {dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            
            <div class="space-y-3">
                {[...this.entries].reverse().slice(0, this.visibleEntries).map((entry) => (
                    <div class="bg-gray-800 hover:bg-gray-700 transition-colors rounded-2xl p-4 shadow-md border border-gray-600 mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex-1">
                                <div class="text-lg font-semibold text-blue-400">
                                    {entry.task}
                                </div>
									<div>
									{entry.tags && entry.tags.length > 0 && (
										<div class="flex flex-wrap gap-2 mt-2">
											{entry.tags.map(tag => (
												<span class="px-2 py-1 bg-gray-700 text-xs text-blue-300 rounded-full">
													{tag}
												</span>
											))}
										</div>
									)}
								</div>
                                <div class="text-sm text-gray-400 mt-1">
                                    Duration: {this.formatDuration(
                                        entry.endTime && entry.endTime > 0 
                                            ? entry.endTime - entry.startTime 
                                            : Date.now() - entry.startTime
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <span class="text-sm text-gray-300">
                            {new Date(entry.startTime).toLocaleString()}
                            {entry.endTime && ` - ${new Date(entry.endTime).toLocaleString()}`}
                        </span>
                    </div>
                ))}
            </div>
			{this.hasMoreEntries && (
                <div class="text-center mt-4">
                    <button 
                        onclick:frontend={() => this.loadMoreEntries()}
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Load More Entries
                    </button>
                </div>
            )}
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

export class HistoryPage extends Component<{
    identifier: string;
    date: string; 
}> {

	@property
    entries!: Set<TimeEntry>;

    @property
    visibleEntries!: number;

    @property
    hasMoreEntries!: boolean;

    private formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / 1000 / 60) % 60;
        const hours = Math.floor(ms / 1000 / 60 / 60);
    
        return `${hours}h ${minutes}m ${seconds}s`;
    }

	private loadMoreEntries() {
        this.visibleEntries += 5;
        this.hasMoreEntries = this.entries.size > this.visibleEntries;
    }
}