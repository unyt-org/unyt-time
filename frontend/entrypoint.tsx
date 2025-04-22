// deno-lint-ignore-file
import { Entrypoint } from "uix/providers/entrypoints.ts";
import "common/theme.ts";
import { FrontPage } from "common/FrontPage.tsx";
import { HistoryPage } from "common/HistoryPage.tsx";
import { TrackPage } from "common/TrackerPage.tsx";
import { identifiers } from "common/components/ids.ts";

export default {
  '/': async () => {
    if(localStorage.getItem("identifier")){
        await redirect(localStorage.getItem("identifier")!)
        return
      }

    return <FrontPage/>
  },
  '/:id': ( _ , {id}) => {
    if(!identifiers.includes(id as any)) {
      throw new Error("User not found");
    }
    localStorage.setItem("identifier", id)
    return <TrackPage identifier={id}/>
    
  },
  '/history/:date': ( _ , {date}) => {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }
    const identifier = localStorage.getItem("identifier");
    if(!identifier) {
      location.href= "/";
      return;
    }
    if(!identifiers.includes(identifier as any)){
      throw new Error("User not found");
    }
    return <HistoryPage identifier={identifier} date={date}/>
  }
} satisfies Entrypoint;
