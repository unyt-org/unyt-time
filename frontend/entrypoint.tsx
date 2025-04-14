import { Entrypoint } from "uix/providers/entrypoints.ts";
import "common/theme.ts";
import { FrontPage } from "common/FrontPage.tsx"
import { TrackPage } from "common/TrackerPage.tsx";
import { identifiers } from "common/components/ids.ts"

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
  '/history/:day': (context, {day}) => {
    return day
  }
} satisfies Entrypoint;
