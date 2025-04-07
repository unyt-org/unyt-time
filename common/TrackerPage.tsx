import { template } from "uix/html/template.ts";
import { Header } from "common/components/header.tsx";

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
  