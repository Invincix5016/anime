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
  getTimingsFromAnimationsOrInstances,
} from './timings.js';

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

export function createTimeline(params = {}) {
  let tl = animate(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    const tlIndex = engine.children.indexOf(tl); // TODO: investigate
    const children = tl.children;
    if (tlIndex > -1) engine.children.splice(tlIndex, 1); // TODO: investigate
    let insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    const tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = parseTimelineOffset(timelineOffset, tlDuration);
    tl.seek(insParams.timelineOffset, true);
    const ins = animate(insParams, tl);
    const totalDuration = ins.duration + insParams.timelineOffset;
    children.push(ins);
    tl._childrenLength = tl.children.length;
    const timings = getTimingsFromAnimationsOrInstances(children, params);
    tl._changeStartTime = timings.changeStartTime;
    tl._changeEndTime = timings.changeEndTime;
    tl.duration = timings.duration;
    tl.seek(0, true);
    tl.reset();
    if (tl.autoplay) tl.play();
    return tl;
  }
  return tl;
}
