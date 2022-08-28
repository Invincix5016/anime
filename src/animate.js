import {
  settings,
  animationTypes,
  valueTypes,
  minValue,
  rgbaString,
  commaString,
  closeParenthesisString,
  closeParenthesisWithSpaceString,
  emptyString,
  transformsFragmentStrings,
} from './consts.js';

import {
  clamp,
  // filterArray,
} from './utils.js';

import {
  engine,
  startEngine,
} from './engine.js';

import {
  createAnimation,
} from './animations.js';

import {
  getTweenProgress,
} from './tweens.js';

import {
  getPathProgress,
} from './svg.js';

import {
  removeAnimatablesFromAnimation,
} from './animatables.js';

export function animate(params = {}) {
  const animation = createAnimation(params);

  function getAdjustedAnimationTime(animation, time) {
    return animation._isReversed ? animation.duration - time : time;
  }

  function resetAnimationTime(animation) {
    animation._startTime = 0;
    animation._lastCurrentTime = getAdjustedAnimationTime(animation, animation.currentTime) * (1 / settings.speed);
  }

  function toggleAnimationDirection(animation) {
    const direction = animation.direction;
    if (direction !== 'alternate') {
      animation.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    animation._isReversed = !animation._isReversed;
    animation.children.forEach(child => child._isReversed = animation._isReversed);
  }

  function syncAnimationChildren(animation, time, muteCallbacks, manual) {
    if (!manual || !animation._isRunningBackwards) {
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

  function renderAnimationTweens(tweens, time) {
    let i = 0;
    const tweensLength = tweens.length;
    while (i < tweensLength) {
      const prevTween = tweens[i - 1];
      const nextTween = tweens[i + 1];
      const tween = tweens[i++];
      if (
        (prevTween && prevTween.groupId == tween.groupId && time < prevTween.end) || 
        (animation._isRunningBackwards && nextTween && nextTween.groupId == tween.groupId && time > nextTween.start)
      ) continue;
      const tweenProgress = tween.easing(clamp(time - tween.start - tween.delay, 0, tween.duration) / tween.duration);
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
      tween.progress = tweenProgress;
      tween.currentValue = value;
    }
  }

  function setAnimationProgress(animation, parentTime, manual) {
    const animationDuration = animation.duration;
    const animationChangeStartTime = animation._changeStartTime;
    const animationChangeEndTime = animationDuration - animation._changeEndTime;
    const animationTime = getAdjustedAnimationTime(animation, parentTime);
    let renderTime = animationTime;
    let canRender = 0;
    animation.progress = clamp((animationTime / animationDuration), 0, 1);
    animation._isRunningBackwards = animationTime < animation.currentTime;
    if (animation.children) { syncAnimationChildren(animation, animationTime, false, manual); }
    if (!animation.began && animation.currentTime > 0) {
      animation.began = true;
      animation.begin(animation);
    }
    if (!animation.loopBegan && animation.currentTime > 0) {
      animation.loopBegan = true;
      animation.loopBegin(animation);
    }
    if (animationTime <= animationChangeStartTime && animation.currentTime !== 0) {
      renderTime = 0;
      canRender = 1;
    }
    if ((animationTime >= animationChangeEndTime && animation.currentTime !== animationDuration) || !animationDuration) {
      renderTime = animationDuration;
      canRender = 1;
    }
    if (animationTime > animationChangeStartTime && animationTime < animationChangeEndTime) {
      if (!animation.changeBegan) {
        animation.changeBegan = true;
        animation.changeCompleted = false;
        animation.changeBegin(animation);
      }
      animation.change(animation);
      canRender = 1;
    } else {
      if (animation.changeBegan) {
        animation.changeCompleted = true;
        animation.changeBegan = false;
        animation.changeComplete(animation);
      }
    }
    animation.currentTime = clamp(renderTime, 0, animationDuration);
    if (canRender) renderAnimationTweens(animation.tweens, animation.currentTime);
    if (animation.began) animation.update(animation);
    if (parentTime >= animationDuration) {
      animation._lastCurrentTime = 0;
      if (animation.remainingIterations && animation.remainingIterations !== true) {
        animation.remainingIterations--;
      }
      if (!animation.remainingIterations) {
        animation.paused = true;
        if (!animation.completed) {
          animation.completed = true;
          animation.loopComplete(animation);
          animation.complete(animation);
          animation._resolve(animation);
        }
      } else {
        animation._startTime = animation._parentCurrentTime;
        animation.loopComplete(animation);
        animation.loopBegan = false;
        if (animation.direction === 'alternate') {
          toggleAnimationDirection(animation);
        }
      }
    }
  }

  animation.reset = function() {
    animation.currentTime = 0;
    animation.progress = 0;
    animation.paused = true;
    animation.began = false;
    animation.loopBegan = false;
    animation.changeBegan = false;
    animation.completed = false;
    animation.changeCompleted = false;
    animation.remainingIterations = animation.loop;
    animation.finished = window.Promise && new Promise(resolve => animation._resolve = resolve);
    animation._childrenLength = animation.children.length;
    animation._isRunningBackwards = false;
    animation._isReversed = animation.direction === 'reverse';
    for (let i = animation._childrenLength; i--;) animation.children[i].reset();
    if (animation._isReversed && animation.loop !== true || (animation.direction === 'alternate' && animation.loop === 1)) animation.remainingIterations++;
    renderAnimationTweens(animation.tweens, animation._isReversed ? animation.duration : 0);
  }

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  animation._onDocumentVisibility = () => resetAnimationTime(animation);

  animation.tick = function(t) {
    animation._parentCurrentTime = t;
    if (!animation._startTime) animation._startTime = animation._parentCurrentTime;
    setAnimationProgress(animation, (animation._parentCurrentTime + (animation._lastCurrentTime - animation._startTime)) * settings.speed);
  }

  animation.seek = function(time, muteCallbacks) {
    if (muteCallbacks) {
      if (animation.children) { syncAnimationChildren(animation, time, true); }
      renderAnimationTweens(animation.tweens, time);
    } else {
      setAnimationProgress(animation, getAdjustedAnimationTime(animation, time), true);
    }
  }

  animation.pause = function() {
    animation.paused = true;
    resetAnimationTime(animation);
  }

  animation.play = function() {
    if (!animation.paused) return;
    if (animation.completed) animation.reset();
    animation.paused = false;
    engine.activeProcesses.push(animation);
    resetAnimationTime(animation);
    startEngine(engine);
  }

  animation.reverse = function() {
    toggleAnimationDirection(animation);
    animation.completed = animation._isReversed ? false : true;
    resetAnimationTime(animation);
  }

  animation.restart = function() {
    animation.reset();
    animation.play();
  }

  animation.remove = function(targets) {
    removeAnimatablesFromAnimation(targets, animation);
  }

  animation.reset();

  if (animation.autoplay) {
    if (animation.duration === minValue) {
      animation.seek(minValue);
    } else {
      animation.play();
    }
  }

  return animation;
}
