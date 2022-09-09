import {
  settings,
  defaultAnimationSettings,
  defaultTweenSettings,
  animationTypes,
  valueTypes,
  rgbaString,
  commaString,
  closeParenthesisString,
  closeParenthesisWithSpaceString,
  emptyString,
  transformsFragmentStrings,
  minValue,
} from './consts.js';

import {
  is,
  clamp,
  replaceObjectProps,
  mergeObjects,
} from './utils.js';

import {
  sanitizePropertyName,
} from './properties.js';

import {
  getAnimatables,
  registerTargetsToMap,
} from './animatables.js';

import {
  getPathProgress,
} from './svg.js';

import {
  getKeyframesFromProperties,
} from './keyframes.js';

import {
  convertKeyframesToTweens,
  getTweenProgress,
} from './tweens.js';

import {
  getAnimationType,
} from './values.js';

import {
  engine,
} from './engine.js';

let animationsId = 0;

export function getAdjustedAnimationTime(animation, time) {
  return animation.isReversed ? animation.duration - time : time;
}

export function resetAnimationTime(animation) {
  animation._startTime = 0;
  animation._lastCurrentTime = getAdjustedAnimationTime(animation, animation.currentTime) * (1 / settings.speed);
  return animation;
}

export function toggleAnimationDirection(animation) {
  const direction = animation.direction;
  if (direction !== 'alternate') {
    animation.direction = direction !== 'normal' ? 'normal' : 'reverse';
  }
  animation.isReversed = !animation.isReversed;
  animation.children.forEach(child => child.isReversed = animation.isReversed);
  return animation;
}

export function syncAnimationChildren(animation, time, muteCallbacks) {
  if (!(time < animation.currentTime)) {
    for (let i = 0; i < animation._childrenLength; i++) {
      const child = animation.children[i];
      child.seek(time - child.timelineOffset, muteCallbacks);
    }
  } else {
    for (let j = animation._childrenLength; j--;) {
      const child = animation.children[j];
      child.seek(time - child.timelineOffset, muteCallbacks);
    }
  }
}

export function renderAnimationTweens(animation, time) {
  let i = 0;
  const tweens = animation.tweens;
  const absTime = animation.timelineOffset + time;
  while (i < animation._tweensLength) {
    const tween = tweens[i++];
    // console.log(tween.isCanceled);
    // console.lo);
    if (
      tween.isCanceled ||
      (tween.isOverridden && absTime > tween.absoluteChangeEnd) ||
      (tween.previous && (absTime < tween.previous.absoluteChangeEnd)) ||
      (tween.next && absTime > tween.next.absoluteStart)
    ) continue;
    const tweenProgress = tween.easing(clamp(time - tween._changeStartTime, 0, tween.changeDuration) / tween.updateDuration);
    const tweenProperty = tween.property;
    const tweenRound = tween.round;
    const tweenFrom = tween.from;
    const tweenTo = tween.to;
    const tweenType = tween.type;
    const tweenValueType = tweenTo.type;
    const tweenTarget = tween.target;

    let value;

    if (tweenValueType == valueTypes.NUMBER) {
      value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound);
    } else if (tweenValueType == valueTypes.UNIT) {
      value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound) + tweenTo.unit;
    } else if (tweenValueType == valueTypes.COLOR) {
      const fn = tweenFrom.numbers;
      const tn = tweenTo.numbers;
      value = rgbaString;
      value += getTweenProgress(fn[0], tn[0], tweenProgress, 1) + commaString;
      value += getTweenProgress(fn[1], tn[1], tweenProgress, 1) + commaString;
      value += getTweenProgress(fn[2], tn[2], tweenProgress, 1) + commaString;
      value += getTweenProgress(fn[3], tn[3], tweenProgress) + closeParenthesisString;
    } else if (tweenValueType == valueTypes.PATH) {
      value = getPathProgress(tweenTo.path, tweenProgress * tweenTo.number, tweenRound) + tweenTo.unit;
    } else if (tweenValueType == valueTypes.COMPLEX) {
      value = tweenTo.strings[0];
      for (let j = 0, l = tweenTo.numbers.length; j < l; j++) {
        const number = getTweenProgress(tweenFrom.numbers[j], tweenTo.numbers[j], tweenProgress, tweenRound);
        const nextString = tweenTo.strings[j + 1];
        if (!nextString) {
          value += number;
        } else {
          value += number + nextString;
        }
      }
    }

    if (tweenType == animationTypes.OBJECT) {
      tweenTarget[tweenProperty] = value;
    } else if (tweenType == animationTypes.TRANSFORM) {
      tween.cachedTransforms[tweenProperty] = value;
      if (tween.renderTransforms) {
        let str = emptyString;
        for (let key in tween.cachedTransforms) {
          str += transformsFragmentStrings[key]+tween.cachedTransforms[key]+closeParenthesisWithSpaceString;
        }
        tweenTarget.style.transform = str;
      }
    } else if (tweenType == animationTypes.CSS) {
      tweenTarget.style[tweenProperty] = value;
    } else if (tweenType == animationTypes.ATTRIBUTE) {
      tweenTarget.setAttribute(tweenProperty, value);
    }
  }
}

export function setAnimationProgress(animation, parentTime) {
  const animationDuration = animation.duration;
  const animationChangeStartTime = animation._changeStartTime;
  const animationChangeEndTime = animation._changeEndTime;
  const animationTime = getAdjustedAnimationTime(animation, parentTime);
  let canRender = (animationTime <= animationChangeStartTime && animation.currentTime !== 0) ||
                  (animationTime >= animationChangeEndTime && animation.currentTime !== animationDuration);
  animation.progress = clamp((animationTime / animationDuration), 0, 1);
  if (animation._childrenLength) { syncAnimationChildren(animation, animationTime, 0); }
  if (!animation.began && animation.currentTime > 0) {
    animation.began = 1;
    animation.begin(animation);
  }
  if (!animation.loopBegan && animation.currentTime > 0) {
    animation.loopBegan = 1;
    animation.loopBegin(animation);
  }
  if (animationTime > animationChangeStartTime && animationTime < animationChangeEndTime) {
    if (!animation.changeBegan) {
      animation.changeBegan = 1;
      animation.changeCompleted = 0;
      animation.changeBegin(animation);
    }
    animation.change(animation);
    canRender = 1;
  } else {
    if (animation.changeBegan) {
      animation.changeCompleted = 1;
      animation.changeBegan = 0;
      animation.changeComplete(animation);
    }
  }
  animation.currentTime = clamp(animationTime, 0, animationDuration);
  if (canRender) renderAnimationTweens(animation, animation.currentTime);
  if (animation.began) animation.update(animation);
  if (parentTime >= animationDuration) {
    animation._lastCurrentTime = 0;
    if (animation.remainingIterations && animation.remainingIterations !== true) {
      animation.remainingIterations--;
    }
    if (!animation.remainingIterations) {
      animation.paused = 1;
      if (!animation.completed) {
        animation.completed = 1;
        animation.loopComplete(animation);
        animation.complete(animation);
        animation._resolve(animation);
      }
    } else {
      animation._startTime = animation._parentCurrentTime;
      animation.loopComplete(animation);
      animation.loopBegan = 0;
      if (animation.direction === 'alternate') {
        toggleAnimationDirection(animation);
      }
    }
  }
}

export function resetAnimation(animation) {
  animation.currentTime = 0;
  animation.progress = 0;
  animation.paused = 1;
  animation.began = 0;
  animation.loopBegan = 0;
  animation.changeBegan = 0;
  animation.completed = 0;
  animation.changeCompleted = 0;
  animation.remainingIterations = animation.loop;
  animation.finished = window.Promise && new Promise(resolve => animation._resolve = resolve);
  animation.isReversed = animation.direction === 'reverse';
  for (let i = animation._childrenLength; i--;) resetAnimation(animation.children[i]);
  if (animation.isReversed && animation.loop !== true || (animation.direction === 'alternate' && animation.loop === 1)) animation.remainingIterations++;
  renderAnimationTweens(animation, animation.isReversed ? animation.duration : 0);
  return animation;
}

export function createAnimation(params, parentAnimation) {
  // const parentTargets = parentAnimation ? parentAnimation.targets : new Map();
  const parent = parentAnimation || engine;
  const animationSettings = replaceObjectProps(defaultAnimationSettings, params);
  const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  const propertyKeyframes = getKeyframesFromProperties(tweenSettings, params);
  const targets = registerTargetsToMap(params.targets, parent.targets);
  const targetsLength = targets.size;

  if (!parentAnimation) {
    animationSettings.timelineOffset = performance.now();
  }

  const { delay, duration, endDelay } = tweenSettings;

  const animation = mergeObjects(animationSettings, {
    id: animationsId++,
    targets: targets,
    parent: parent,
    tweens: [],
    children: [],
    duration: delay + duration + endDelay, // Total duration of the animation
    progress: 0, // [0 to 1] range, represent the % of completion of an animation total duration
    currentTime: 0, // The curent time relative to the animation [0 to animation duration]
    _tweensLength: 0,
    _parentCurrentTime: 0, // Root animation current time for simple animations or timeline current time for timeline children
    _startTime: 0, // Store at what parentCurrentTime the animation started to calculate the relative currentTime
    _lastCurrentTime: 0, // Store the animation current time when the animation playback is paused to adjust the new time when played again
    _changeStartTime: delay,
    _changeEndTime: delay + duration,
    _childrenLength: 0,
  });

  if (targets.size) {
    let animCST;
    let animCET = 0;
    let animDUR = 0;
    let i = 0;
    targets.forEach((targetTweens, target) => {
      let lastTransformGroupIndex;
      let lastTransformGroupLength;
      for (let j = 0, keysLength = propertyKeyframes.length; j < keysLength; j++) {
        const keyframes = propertyKeyframes[j];
        const keyframesPropertyName = keyframes[0].property;
        const type = getAnimationType(target, keyframesPropertyName);
        const property = sanitizePropertyName(keyframesPropertyName, target, type);
        let targetPropertyTweens = targetTweens[property];
        if (!targetPropertyTweens) targetPropertyTweens = targetTweens[property] = [];
        if (is.num(type)) {
          const animationPropertyTweens = convertKeyframesToTweens(animation, keyframes, target, targetPropertyTweens, property, type, i);
          const animationPropertyTweensLength = animationPropertyTweens.length;
          const firstTween = animationPropertyTweens[0];
          const lastTween = animationPropertyTweens[animationPropertyTweensLength - 1];
          const lastTweenCET = lastTween._changeEndTime;
          if (is.und(animCST) || firstTween._changeStartTime < animCST) animCST = firstTween._changeStartTime;
          if (lastTween.end > animDUR) animDUR = lastTween.end;
          if (lastTweenCET > animCET) animCET = lastTweenCET;
          if (type == animationTypes.TRANSFORM) {
            lastTransformGroupIndex = animation.tweens.length;
            lastTransformGroupLength = lastTransformGroupIndex + animationPropertyTweensLength;
          }
          animation.tweens.push(...animationPropertyTweens);
        }
      }
      if (!is.und(lastTransformGroupIndex)) {
        for (let t = lastTransformGroupIndex; t < lastTransformGroupLength; t++) {
          animation.tweens[t].renderTransforms = true;
        }
      }
      i++;
    });

    animation.duration = animDUR;
    animation._changeStartTime = animCST;
    animation._changeEndTime = animDUR - (animDUR - animCET);

    animation._tweensLength = animation.tweens.length;
  }

  return resetAnimation(animation);
}
