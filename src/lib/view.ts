import type { Edition } from "./edition";
import type { LaunchData, WorldMap } from "./types";

/** Props every ported page view receives from its (server) route file. */
export interface ViewProps {
  edition: Edition;
  data: LaunchData;
  /** Present for views that draw the country access map. */
  map?: WorldMap;
}
