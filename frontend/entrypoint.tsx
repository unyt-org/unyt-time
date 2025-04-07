import { Entrypoint } from "uix/providers/entrypoints.ts";
import "common/theme.ts";

import { Main } from "common/TrackerPage.tsx";
export default {
  '/': <Main></Main>

} satisfies Entrypoint;