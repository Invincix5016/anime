import {
  is
} from './utils.js';

export function getTimingsFromAnimationsOrInstances(animationsOrInstances, tweenSettings) {
  const animationsLength = animationsOrInstances.length;
  if (!animationsLength) {
    return {
      duration: tweenSettings.duration,
      changeStartTime: tweenSettings.delay,
      changeEndTime: tweenSettings.endDelay,
    };
  } else {
    const timings = {};
    for (let i = 0; i < animationsLength; i++) {
      const anim = animationsOrInstances[i];
      const timelineOffset = anim.timelineOffset ? anim.timelineOffset : 0;
      const changeStartTime = timelineOffset + anim.changeStartTime;
      if (is.und(timings.changeStartTime) || changeStartTime < timings.changeStartTime) {
        timings.changeStartTime = changeStartTime;
      }
      const duration = timelineOffset + anim.duration;
      if (is.und(timings.duration) || duration > timings.duration) {
        timings.duration = duration;
      }
      const changeEndTime = timelineOffset + anim.duration - anim.changeEndTime;
      if (is.und(timings.changeEndTime) || changeEndTime > timings.changeEndTime) {
        timings.changeEndTime = changeEndTime;
      }
    }
    timings.changeEndTime = timings.duration - timings.changeEndTime;
    return timings;
  }
}
