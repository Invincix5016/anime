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
  startEngine,
  activeAnimations,
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
  // let _startTime = 0, _lastTime = 0, _now = 0;
  let children, childrenLength = 0;
  // let resolve = null;

  // function makePromise(animation) {
  //   const promise = window.Promise && new Promise(_resolve => resolve = _resolve);
  //   animation.finished = promise;
  //   return promise;
  // }

  const animation = createAnimation(params);
  // let promise = makePromise(animation);

  function toggleAnimationDirection() {
    const direction = animation.direction;
    if (direction !== 'alternate') {
      animation.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    animation.reversed = !animation.reversed;
    children.forEach(child => child.reversed = animation.reversed);
  }

  function adjustTime(time) {
    return animation.reversed ? animation.duration - time : time;
  }

  function resetTime() {
    animation._startTime = 0;
    animation._lastTime = adjustTime(animation.currentTime) * (1 / settings.speed);
  }

  function seekChild(time, child, ignoreCallbacks) {
    if (child) {
      child.seek(time - child.timelineOffset, ignoreCallbacks);
    }
  }

  function syncAnimationChildren(time, ignoreCallbacks) {
    if (!animation.reversePlayback) {
      for (let i = 0; i < childrenLength; i++) seekChild(time, children[i], ignoreCallbacks);
    } else {
      for (let j = childrenLength; j--;) seekChild(time, children[j], ignoreCallbacks);
    }
  }

  function setTweensProgress(insTime) {
    let i = 0;
    const tweens = animation.tweens;
    const tweensLength = tweens.length;
    while (i < tweensLength) {
      // // Only check for keyframes if there is more than one tween
      // if (tweensLength) tween = filterArray(tweens, t => (insTime < t.end))[0] || tween;
      const prevTween = tweens[i - 1];
      const tween = tweens[i++];
      if (prevTween && prevTween.groupId === tween.groupId && insTime < prevTween.end) continue;
      const tweenProgress = tween.easing(clamp(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration);
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

  function setAnimationProgress(engineTime, ignoreCallbacks) {
    const insDuration = animation.duration;
    const insChangeStartTime = animation.changeStartTime;
    const insChangeEndTime = insDuration - animation.changeEndTime;
    const insTime = adjustTime(engineTime);
    let renderTime = insTime;
    let needsRender = ignoreCallbacks;
    animation.progress = clamp((insTime / insDuration), 0, 1);
    if (children) { syncAnimationChildren(insTime, ignoreCallbacks); }
    if (insTime <= insChangeStartTime && animation.currentTime !== 0) {
      renderTime = 0;
      needsRender = 1;
    }
    if (!insDuration || (insTime >= insChangeEndTime && animation.currentTime !== insDuration)) {
      renderTime = insDuration;
      needsRender = 1;
    }
    if (!ignoreCallbacks) {
      animation.reversePlayback = insTime < animation.currentTime;
      if (!animation.began && animation.currentTime > 0) {
        animation.began = true;
        animation.begin(animation);
      }
      if (!animation.loopBegan && animation.currentTime > 0) {
        animation.loopBegan = true;
        animation.loopBegin(animation);
      }
      if (insTime > insChangeStartTime && insTime < insChangeEndTime) {
        if (!animation.changeBegan) {
          animation.changeBegan = true;
          animation.changeCompleted = false;
          animation.changeBegin(animation);
        }
        animation.change(animation);
        needsRender = 1;
      } else {
        if (animation.changeBegan) {
          animation.changeCompleted = true;
          animation.changeBegan = false;
          animation.changeComplete(animation);
        }
      }
    }
    animation.currentTime = clamp(renderTime, 0, insDuration);
    if (needsRender) {
      setTweensProgress(animation.currentTime);
    }
    if (ignoreCallbacks) return;
    if (animation.began) animation.update(animation);
    if (engineTime >= insDuration) {
      animation._lastTime = 0;
      if (animation.remainingLoops && animation.remainingLoops !== true) {
        animation.remainingLoops--;
      }
      if (!animation.remainingLoops) {
        animation.paused = true;
        if (!animation.completed) {
          animation.completed = true;
          animation.loopComplete(animation);
          animation.complete(animation);
          // resolve();
          // promise = makePromise(animation);
        }
      } else {
        animation._startTime = animation._now;
        animation.loopComplete(animation);
        animation.loopBegan = false;
        if (animation.direction === 'alternate') {
          toggleAnimationDirection();
        }
      }
    }
  }

  animation.reset = function() {
    const direction = animation.direction;
    animation.currentTime = 0;
    animation.progress = 0;
    animation.paused = true;
    animation.began = false;
    animation.loopBegan = false;
    animation.changeBegan = false;
    animation.completed = false;
    animation.changeCompleted = false;
    animation.reversePlayback = false;
    animation.reversed = direction === 'reverse';
    animation.remainingLoops = animation.loop;
    children = animation.children;
    childrenLength = children.length;
    for (let i = childrenLength; i--;) animation.children[i].reset();
    if (animation.reversed && animation.loop !== true || (direction === 'alternate' && animation.loop === 1)) animation.remainingLoops++;
    // setTweensProgress(animation.reversed ? animation.duration : 0);
    setAnimationProgress(animation.reversed ? animation.duration : 0, true);
  }

  // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
  animation._onDocumentVisibility = resetTime;

  animation.tick = function(animation, t) {
    animation._now = t;
    if (!animation._startTime) animation._startTime = animation._now;
    setAnimationProgress((animation._now + (animation._lastTime - animation._startTime)) * settings.speed);
  }

  animation.seek = function(time, muteCallbacks) {
    setAnimationProgress(adjustTime(time), muteCallbacks);
  }

  animation.seekSilently = function(time) {
    // // const insTime = adjustTime(time);
    // if (children) { syncAnimationChildren(time, true); }
    // setTweensProgress(time);
    setAnimationProgress(adjustTime(time), true);
  }

  animation.pause = function() {
    animation.paused = true;
    resetTime();
  }

  animation.play = function() {
    if (!animation.paused) return;
    if (animation.completed) animation.reset();
    animation.paused = false;
    activeAnimations.push(animation);
    resetTime();
    startEngine();
  }

  animation.reverse = function() {
    toggleAnimationDirection();
    animation.completed = animation.reversed ? false : true;
    resetTime();
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
