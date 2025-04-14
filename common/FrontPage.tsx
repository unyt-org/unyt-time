import { template } from "uix/html/template.ts";
import { Component } from "uix/components/Component.ts";
import { identifiers } from "./components/ids.ts";

@template(() => {
    return <div class="max-w-screen min-h-screen mx-auto p-8 font-sans text-gray-200 bg-gray-800 bg-opacity-80 shadow-lg border border-gray-700">
        <h1 class="text-3xl text-center text-blue-400 mb-8 font-bold text-shadow">Select User</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            {identifiers.map(id => (
                <a 
                    href={`/${id}`}
                    class="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl text-center text-xl font-medium transition duration-200"
                >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
            ))}
        </div>
    </div>
})

export class FrontPage extends Component {}