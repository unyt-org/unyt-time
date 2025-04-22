import { TimeEntry } from "common/types.ts";

export function calculateTotalDuration(entries: Set<TimeEntry>): number {
    let totalMs = 0;
    entries.forEach(entry => {
        totalMs += entry.endTime && entry.endTime > 0 
            ? entry.endTime - entry.startTime 
            : Date.now() - entry.startTime;
    });
    return totalMs;
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 1000 / 60) % 60;
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours}h ${minutes}m ${seconds}s`;
}

export function getTotalDurationForSelectedDay(entries: Set<TimeEntry>): string {
    return formatDuration(calculateTotalDuration(entries));
}