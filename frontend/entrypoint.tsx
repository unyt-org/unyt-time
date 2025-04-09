import { Entrypoint } from "uix/providers/entrypoints.ts";
import "common/theme.ts";

import { TrackPage } from "common/TrackerPage.tsx";
export default {
  '/': <TrackPage identifier="2"></TrackPage>

} satisfies Entrypoint;