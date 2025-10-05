import { STOPS, STREAM } from "../enums";
import { StreamConfig } from "../types";

export const defaults: StreamConfig = {
  stream: STREAM.smooth,
  speed: 20,
  stops: [
    {
      signs: [STOPS.mid],
      duration: 400,
    },
    {
      signs: [STOPS.end],
      duration: 750,
    },
  ],
  debug: false,
};
