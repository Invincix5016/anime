import {
  is
} from './utils.js';

export function getTimingsFromAnimationsOrInstances(animationsOrInstances, tweenSettings) {
  const animationsLength = animationsOrInstances.length;
  if (!animationsLength) {
    return tweenSettings;
  } else {
    const timings = {};
    for (let i = 0; i < animationsLength; i++) {
      const anim = animationsOrInstances[i];
      const timelineOffset = anim.timelineOffset ? anim.timelineOffset : 0;
      const delay = timelineOffset + anim.delay;
      if (is.und(timings.delay) || delay < timings.delay) {
        timings.delay = delay;
      }
      const duration = timelineOffset + anim.duration;
      if (is.und(timings.duration) || duration > timings.duration) {
        timings.duration = duration;
      }
      const endDelay = timelineOffset + anim.duration - anim.endDelay;
      if (is.und(timings.endDelay) || endDelay > timings.endDelay) {
        timings.endDelay = endDelay;
      }
    }
    timings.endDelay = timings.duration - timings.endDelay;
    return timings;
  }
}
