import {
  settings,
  valueTypes,
  animationTypes,
  rgbaString,
  commaString,
  openParenthesisString,
  closeParenthesisString,
  closeParenthesisWithSpaceString,
  emptyString,
  transformsFragmentStrings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
  addNodeToLinkedList,
  clamp,
  round,
} from './utils.js';


export const activeInstances = [];
export const rootTimeline = {
  currentTime: 0
};

function adjustTime(animation, time) {
  return animation.reversed ? animation.duration - time : time;
}

function getTweenProgress(fromNumber, toNumber, progressValue, roundValue) {
  let value = fromNumber + (progressValue * (toNumber - fromNumber));
  return !roundValue ? value : round(value, roundValue);
}

function setAnimationProgress(animation) {
  animation.now = animation.timeline.currentTime;
  if (!animation.startTime) animation.startTime = animation.now;
  const engineTime = (animation.now + (animation.lastTime - animation.startTime)) * settings.speed;
  const insDuration = animation.duration;
  const insChangeStartTime = animation.changeStartTime;
  const insChangeEndTime = insDuration - animation.changeEndTime;
  const animTime = adjustTime(animation, engineTime);
  // console.log(animTime, engineTime);
  animation.progress = clamp((animTime / insDuration), 0, 1);
  animation.reversePlayback = animTime < animTime;
  // if (children) { syncInstanceChildren(animTime); }
  if (!animation.began && animTime > 0) {
    animation.began = true;
    animation.begin(animation);
  }
  if (!animation.loopBegan && animTime > 0) {
    animation.loopBegan = true;
    animation.loopBegin(animation);
  }
  if (animTime <= insChangeStartTime && animTime !== 0) {
    // setAnimationsProgress(0);
  }
  if ((animTime >= insChangeEndTime && animTime !== insDuration) || !insDuration) {
    // setAnimationsProgress(insDuration);
  }
  if (animTime > insChangeStartTime && animTime < insChangeEndTime) {
    if (!animation.changeBegan) {
      animation.changeBegan = true;
      animation.changeCompleted = false;
      animation.changeBegin(animation);
    }
    animation.change(animation);
    // setAnimationsProgress(animTime);
  } else {
    if (animation.changeBegan) {
      animation.changeCompleted = true;
      animation.changeBegan = false;
      animation.changeComplete(animation);
    }
  }
  animation.currentTime = clamp(animTime, 0, insDuration);
  if (animation.began) animation.update(animation);
  if (engineTime >= insDuration) {
    animation.lastTime = 0;
    if (animation.remainingLoops && animation.remainingLoops !== true) {
      animation.remainingLoops--;
    }
    if (!animation.remainingLoops) {
      animation.paused = true;
      if (!animation.completed) {
        animation.completed = true;
        animation.loopComplete(animation);
        animation.complete(animation);
        // animation.resolve();
        // animation.promise = makePromise(animation);
      }
    } else {
      animation.startTime = animation.now;
      animation.loopComplete(animation);
      animation.loopBegan = false;
      // if (animation.direction === 'alternate') {
      //   toggleInstanceDirection();
      // }
    }
  }
}

function setTweenProgress(tween) {
  const animationTime = tween.animation.currentTime;
  const canRender = !(tween._previous && tween._previous.groupId === tween.groupId && animationTime < tween._previous.end);
  if (canRender) {
    const tweenProgress = tween.easing(clamp(animationTime - tween.start - tween.delay, 0, tween.duration) / tween.duration);
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


let raf;

function tick(t) {
  raf = requestAnimationFrame(tick);
  rootTimeline.currentTime = t;
  let nextProcess = rootTimeline._next;
  while (nextProcess) {
    const cachedNext = nextProcess._next;
    if (nextProcess.processType === 'tween') {
      setTweenProgress(nextProcess);
    } else {
      setAnimationProgress(nextProcess);
    }
    nextProcess = cachedNext;
  }
}

// export function startEngine() {
//   if (!raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && activeInstances.length > 0) {
//     raf = requestAnimationFrame(tick);
//     console.log(rootTimeline);
//   }
// }

export function startEngine() {
  if (!raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && rootTimeline._next) {
    raf = requestAnimationFrame(tick);
  }
}

function handleVisibilityChange() {
  if (!settings.suspendWhenDocumentHidden) return;

  if (isDocumentHidden()) {
    // suspend ticks
    raf = cancelAnimationFrame(raf);
  } else {
    // is back to active tab
    // first adjust animations to consider the time that ticks were suspended
    activeInstances.forEach(
      instance => instance ._onDocumentVisibility()
    );
    startEngine();
  }
}

if (isBrowser) {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
