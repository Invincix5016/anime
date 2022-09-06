import {
  is
} from './utils.js';

export function getTimingsFromAnimationsOrInstances(animation) {
  const children = animation.children.length ? animation.children : animation.tweens;
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i];
    const timelineOffset = child.timelineOffset ? child.timelineOffset : 0;
    const changeStartTime = timelineOffset + child._changeStartTime;
    if (is.und(animation._changeStartTime) || changeStartTime < animation._changeStartTime) {
      animation._changeStartTime = changeStartTime;
    }
    const duration = timelineOffset + child.duration;
    if (is.und(animation.duration) || duration > animation.duration) {
      animation.duration = duration;
    }
    const changeEndTime = timelineOffset + child._changeEndTime;

    if (is.und(animation._changeEndTime) || changeEndTime > animation._changeEndTime) {
      animation._changeEndTime = changeEndTime;
    }
  }

  animation._changeEndTime = animation.duration - (animation.duration - animation._changeEndTime);
}
