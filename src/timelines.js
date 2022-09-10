import {
  defaultTweenSettings,
  relativeValuesExecRgx,
} from './consts.js';

import {
  replaceObjectProps,
  mergeObjects,
  is,
} from './utils.js';

import {
  getRelativeValue,
} from './values.js';

import {
  createAnimation,
} from './animations.js';

import {
  animate,
} from './animate.js';

import {
  engine,
} from './engine.js';

function parseTimelineOffset(timelineOffset, timelineDuration) {
  if (is.und(timelineOffset)) return timelineDuration;
  if (is.num(timelineOffset)) return timelineOffset;
  const operatorMatch = relativeValuesExecRgx.exec(timelineOffset);
  if (operatorMatch) {
    const parsedOffset = +timelineOffset.slice(2);
    const operator = operatorMatch[0][0];
    return getRelativeValue(timelineDuration, parsedOffset, operator);
  }
}

export function createTimeline(tlParams = {}) {
  let tl = animate(tlParams);
  tl.duration = 0; // Total TL duration should start at 0 and grow when adding children
  tl.add = function(animationParams, timelineOffset) {
    // const tlIndex = engine.children.indexOf(tl); // TODO: investigate
    // const children = tl.children;
    // if (tlIndex > -1) engine.children.splice(tlIndex, 1); // TODO: investigate
    let animParams = mergeObjects(animationParams, replaceObjectProps(defaultTweenSettings, tlParams));
    animParams.targets = animParams.targets || tlParams.targets;
    animParams.autoplay = false;
    // animParams.direction = tl.direction; // TODO: investigate
    animParams.timelineOffset = parseTimelineOffset(timelineOffset, tl.duration);
    tl.seek(animParams.timelineOffset, true);
    tl.children.push(createAnimation(animParams, tl));
    tl._childrenLength = tl.children.length;
    for (let i = 0, l = tl._childrenLength; i < l; i++) {
      const child = tl.children[i];
      const childTLOffset = child.timelineOffset;
      const childCST = childTLOffset + child._changeStartTime;
      if (is.und(tl._changeStartTime) || childCST < tl._changeStartTime) tl._changeStartTime = childCST;
      const childDur = childTLOffset + child.duration;
      if (childDur > tl.duration) tl.duration = childDur;
      const childCET = childTLOffset + child._changeEndTime;
      if (childCET > tl._changeEndTime) tl._changeEndTime = childCET;
    }
    tl._changeEndTime = tl.duration - (tl.duration - tl._changeEndTime);
    tl.seek(0, true);
    tl.reset();
    if (tl.autoplay) tl.play();
    return tl;
  }
  return tl;
}
