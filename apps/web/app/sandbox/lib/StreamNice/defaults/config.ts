import { STOPS, STREAM } from "../enums";
import { StreamConfig } from "../types";

export const defaults: StreamConfig = {
  stream: STREAM.smooth,
  speed: 20,
  stops: [
    {
      sign: [STOPS.mid],
      duration: 400,
    },
    {
      sign: [STOPS.end],
      duration: 750,
    },
  ],
  debug: false,
};
