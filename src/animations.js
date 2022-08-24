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

function getAnimations(targets, keyframes, tweenSettings) {
  const animations = [];
  const tweens = [];
  const targetsLength = targets.length;
  let animationsIndex = 0;
  let minDelay = !targetsLength ? tweenSettings.delay : null;
  let maxDuration = !targetsLength ? tweenSettings.duration : 0;
  let maxEndDelay = !targetsLength ? tweenSettings.delay : 0;
  for (let i = 0; i < targetsLength; i++) {
    const target = targets[i];
    if (target) {
      let lastAnimatableTransformAnimationIndex;
      for (let j = 0, keysLength = keyframes.length; j < keysLength; j++) {
        const animationKeyframes = keyframes[j];
        const animationKeyframesPropertyName = animationKeyframes[0].property;
        const animationType = getAnimationType(target, animationKeyframesPropertyName);
        const tweenPropertyName = sanitizePropertyName(animationKeyframesPropertyName, target, animationType);
        if (is.num(animationType)) {
          const animationTweens = convertKeyframesToTweens(animationKeyframes, target, tweenPropertyName, animationType, i, targetsLength, tweensGroupsId);
          const firstTween = animationTweens[0];
          const lastTween = animationTweens[animationTweens.length - 1];
          const endDelay = lastTween.end - lastTween.endDelay;
          if (is.nil(minDelay) || firstTween.delay < minDelay) minDelay = firstTween.delay;
          if (lastTween.end > maxDuration) maxDuration = lastTween.end;
          if (endDelay > maxEndDelay) maxEndDelay = endDelay;
          const animation = {
            tweens: animationTweens,
            delay: firstTween.delay,
            duration: lastTween.end,
            endDelay: lastTween.endDelay,
          }
          if (animationType == animationTypes.TRANSFORM) {
            lastAnimatableTransformAnimationIndex = animationsIndex;
          }
          animations.push(animation);
          tweens.push(...animationTweens);
          tweensGroupsId++;
          animationsIndex++;
        }
      }
      if (!is.und(lastAnimatableTransformAnimationIndex)) {
        animations[lastAnimatableTransformAnimationIndex].tweens.forEach(tween => {
          tween.renderTransforms = true;
        });
      }
    }
  }
  maxEndDelay = maxDuration - maxEndDelay;
  return { animations, tweens, minDelay, maxDuration, maxEndDelay };
}

export function createAnimation(params) {
  const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const properties = getKeyframesFromProperties(tweenSettings, params);
  const targets = getAnimatables(params.targets);
  const { animations, tweens, minDelay, maxDuration, maxEndDelay } = getAnimations(targets, properties, tweenSettings);
  return mergeObjects(instanceSettings, {
    id: animationsId++,
    children: [],
    targets: targets,
    animations: animations,
    tweens: tweens,
    duration: maxDuration,
    changeStartTime: minDelay,
    changeEndTime: maxEndDelay,
  });
}
