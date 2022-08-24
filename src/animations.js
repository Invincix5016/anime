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
  getTimingsFromAnimationsOrInstances,
} from './timings.js';

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

function getAnimations(targets, keyframes) {
  const animations = [];
  const tweens = [];
  let animationsIndex = 0;
  for (let i = 0, targetsLength = targets.length; i < targetsLength; i++) {
    const target = targets[i];
    if (target) {
      let lastAnimatableTransformAnimationIndex;
      for (let j = 0, keysLength = keyframes.length; j < keysLength; j++) {
        const animationKeyframes = keyframes[j];
        const animationKeyframesPropertyName = animationKeyframes[0].property;
        const animationType = getAnimationType(target, animationKeyframesPropertyName);
        const tweenPropertyName = sanitizePropertyName(animationKeyframesPropertyName, target, animationType);
        if (is.num(animationType)) {
          const animationTweens = convertKeyframesToTweens(animationKeyframes, target, tweenPropertyName, animationType, i, targetsLength);
          const firstTween = animationTweens[0];
          const lastTween = animationTweens[animationTweens.length - 1];
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
          animationTweens.forEach(tween => {
            tween.groupId = tweensGroupsId;
            tweens.push(tween);
          });
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
  return {animations, tweens};
}

export function createAnimation(params) {
  const instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const properties = getKeyframesFromProperties(tweenSettings, params);
  const targets = getAnimatables(params.targets);
  const { animations, tweens } = getAnimations(targets, properties);
  const timings = getTimingsFromAnimationsOrInstances(animations, tweenSettings);
  return mergeObjects(instanceSettings, {
    id: animationsId++,
    children: [],
    targets: targets,
    animations: animations,
    tweens: tweens,
    delay: timings.delay,
    duration: timings.duration,
    endDelay: timings.endDelay,
  });
}
