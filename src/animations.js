import {
  defaultAnimationSettings,
  defaultTweenSettings,
  animationTypes,
} from './consts.js';

import {
  is,
  replaceObjectProps,
  mergeObjects,
} from './utils.js';

import {
  sanitizePropertyName,
} from './properties.js';

import {
  getAnimatables,
} from './animatables.js';

import {
  getKeyframesFromProperties,
} from './keyframes.js';

import {
  convertKeyframesToTweens,
} from './tweens.js';

import {
  getAnimationType,
} from './values.js';

let animationsId = 0;
let tweensGroupsId = 0;

export function createAnimation(params) {
  const instanceSettings = replaceObjectProps(defaultAnimationSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const propertyKeyframes = getKeyframesFromProperties(tweenSettings, params);
  const targets = getAnimatables(params.targets);
  const targetsLength = targets.length;
  const tweens = [];

  let maxDuration = 0;
  let changeStartTime;
  let changeEndTime = 0;

  for (let i = 0; i < targetsLength; i++) {
    const target = targets[i];
    if (target) {
      let lastTransformGroupIndex;
      let lastTransformGroupLength;
      for (let j = 0, keysLength = propertyKeyframes.length; j < keysLength; j++) {
        const keyframes = propertyKeyframes[j];
        const keyframesPropertyName = keyframes[0].property;
        const type = getAnimationType(target, keyframesPropertyName);
        const property = sanitizePropertyName(keyframesPropertyName, target, type);
        if (is.num(type)) {
          const tweensGroup = convertKeyframesToTweens(keyframes, target, property, type, i, targetsLength, tweensGroupsId);
          const tweensGroupLength = tweensGroup.length;
          const firstTween = tweensGroup[0];
          const lastTween = tweensGroup[tweensGroupLength - 1];
          const lastTweenChangeEndTime = lastTween.end - lastTween.endDelay;
          if (is.und(changeStartTime) || firstTween.delay < changeStartTime) changeStartTime = firstTween.delay;
          if (lastTween.end > maxDuration) maxDuration = lastTween.end;
          if (lastTweenChangeEndTime > changeEndTime) changeEndTime = lastTweenChangeEndTime;
          if (type == animationTypes.TRANSFORM) {
            lastTransformGroupIndex = tweens.length;
            lastTransformGroupLength = lastTransformGroupIndex + tweensGroupLength;
          }
          tweens.push(...tweensGroup);
          tweensGroupsId++;
        }
      }
      if (!is.und(lastTransformGroupIndex)) {
        for (let t = lastTransformGroupIndex; t < lastTransformGroupLength; t++) {
          tweens[t].renderTransforms = true;
        }
      }
    }
  }

  return mergeObjects(instanceSettings, {
    id: animationsId++,
    targets: targets,
    tweens: tweens,
    duration: targetsLength ? maxDuration : tweenSettings.duration,
    changeStartTime: targetsLength ? changeStartTime : tweenSettings.delay,
    changeEndTime: targetsLength ? maxDuration - changeEndTime : tweenSettings.endDelay,
    _now: 0,
    _startTime: 0,
    _lastTime: 0,
    children: [],
  });
}
