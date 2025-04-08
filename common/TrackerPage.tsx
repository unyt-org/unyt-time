import { template } from "uix/html/template.ts";
import { Header } from "common/components/header.tsx";
import { Tracker } from "backend/Tracker.ts";
import { TimeEntry } from "common/types.ts";

 
await Tracker.addEntry("2", TimeEntry({task:"homework", startTime:new Date, endTime:new Date, tags:["homework"]}))
console.log(await Tracker.getEntries("2"));

export const Main = template (() => 
	<div>
		<Header></Header>
		<div class="controls">
			{/* <button></button> button start/stop 
			<button></button> button addEntry */}
		</div>
		<div>
			<p class="text-amber-50">Add Manual Entry</p>
		</div>


	</div>
  );
  