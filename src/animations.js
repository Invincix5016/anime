import {
  defaultInstanceSettings,
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

let tweensGroupsId = 0;
let animationsId = 0;

export function createAnimation(params) {
  const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const keyframes = getKeyframesFromProperties(tweenSettings, params);
  const targets = getAnimatables(params.targets);
  const targetsLength = targets.length;

  let minDelay = !targetsLength ? tweenSettings.delay : undefined;
  let maxDuration = !targetsLength ? tweenSettings.duration : 0;
  let maxEndDelay = !targetsLength ? tweenSettings.delay : 0;

  const tweens = [];

  for (let i = 0; i < targetsLength; i++) {
    const target = targets[i];
    if (target) {
      let lastTransformFirstTweenIndex;
      let lastTransformLastTweenIndex;
      for (let j = 0, keysLength = keyframes.length; j < keysLength; j++) {
        const tweenKeyframes = keyframes[j];
        const tweenKeyframesPropertyName = tweenKeyframes[0].property;
        const tweenType = getAnimationType(target, tweenKeyframesPropertyName);
        const tweenPropertyName = sanitizePropertyName(tweenKeyframesPropertyName, target, tweenType);
        if (is.num(tweenType)) {
          const tweensGroup = convertKeyframesToTweens(tweenKeyframes, target, tweenPropertyName, tweenType, i, targetsLength, tweensGroupsId);
          const tweensGroupLength = tweensGroup.length;
          const firstTween = tweensGroup[0];
          const lastTween = tweensGroup[tweensGroupLength - 1];
          const endDelay = lastTween.end - lastTween.endDelay;
          if (is.und(minDelay) || firstTween.delay < minDelay) minDelay = firstTween.delay;
          if (lastTween.end > maxDuration) maxDuration = lastTween.end;
          if (endDelay > maxEndDelay) maxEndDelay = endDelay;
          if (tweenType == animationTypes.TRANSFORM) {
            lastTransformFirstTweenIndex = tweens.length;
            lastTransformLastTweenIndex = lastTransformFirstTweenIndex + tweensGroupLength;
          }
          tweens.push(...tweensGroup);
          tweensGroupsId++;
        }
      }
      if (!is.und(lastTransformFirstTweenIndex)) {
        for (let t = lastTransformFirstTweenIndex; t < lastTransformLastTweenIndex; t++) {
          tweens[t].renderTransforms = true;
        }
      }
    }
  }

  return mergeObjects(instanceSettings, {
    id: animationsId++,
    children: [],
    targets: targets,
    tweens: tweens,
    duration: maxDuration,
    changeStartTime: minDelay,
    changeEndTime: maxDuration - maxEndDelay,
  });
}
