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


let raf;
let nextProcess;
let cachedNextProcess;

function tick(t) {
  raf = requestAnimationFrame(tick);
  rootTimeline.currentTime = t;
  nextProcess = rootTimeline._next;
  while (nextProcess) {
    if (nextProcess._isTween) {
      const animationTime = nextProcess.animation.currentTime;
      const canRender = !(nextProcess._previous && nextProcess._previous.groupId === nextProcess.groupId && animationTime < nextProcess._previous.end);
      if (canRender) {
        const tweenProgress = nextProcess.easing(clamp(animationTime - nextProcess.start - nextProcess.delay, 0, nextProcess.duration) / nextProcess.duration);
        const tweenProperty = nextProcess.property;
        const tweenRound = nextProcess.round;
        const tweenFrom = nextProcess.from;
        const tweenTo = nextProcess.to;
        const tweenType = nextProcess.type;
        const tweenValueType = tweenTo.type;
        const tweenTarget = nextProcess.target;

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
          nextProcess.cachedTransforms[tweenProperty] = value;
          if (nextProcess.renderTransforms) {
            let str = emptyString;
            for (let key in nextProcess.cachedTransforms) {
              str += transformsFragmentStrings[key]+nextProcess.cachedTransforms[key]+closeParenthesisWithSpaceString;
            }
            tweenTarget.style.transform = str;
          }
        } else if (tweenType == animationTypes.CSS) {
          tweenTarget.style[tweenProperty] = value;
        } else if (tweenType == animationTypes.ATTRIBUTE) {
          tweenTarget.setAttribute(tweenProperty, value);
        }
        nextProcess.progress = tweenProgress;
        nextProcess.currentValue = value;
      }
    } else {
      nextProcess.now = nextProcess.timeline.currentTime;
      if (!nextProcess.startTime) nextProcess.startTime = nextProcess.now;
      const engineTime = (nextProcess.now + (nextProcess.lastTime - nextProcess.startTime)) * settings.speed;
      const insDuration = nextProcess.duration;
      const insChangeStartTime = nextProcess.changeStartTime;
      const insChangeEndTime = insDuration - nextProcess.changeEndTime;
      const animTime = adjustTime(nextProcess, engineTime);
      // console.log(animTime, engineTime);
      nextProcess.progress = clamp((animTime / insDuration), 0, 1);
      nextProcess.reversePlayback = animTime < animTime;
      // if (children) { syncInstanceChildren(animTime); }
      if (!nextProcess.began && animTime > 0) {
        nextProcess.began = true;
        nextProcess.begin(nextProcess);
      }
      if (!nextProcess.loopBegan && animTime > 0) {
        nextProcess.loopBegan = true;
        nextProcess.loopBegin(nextProcess);
      }
      // if (animTime <= insChangeStartTime && animTime !== 0) {
      //   // setAnimationsProgress(0);
      // }
      // if ((animTime >= insChangeEndTime && animTime !== insDuration) || !insDuration) {
      //   // setAnimationsProgress(insDuration);
      // }
      if (animTime > insChangeStartTime && animTime < insChangeEndTime) {
        if (!nextProcess.changeBegan) {
          nextProcess.changeBegan = true;
          nextProcess.changeCompleted = false;
          nextProcess.changeBegin(nextProcess);
        }
        nextProcess.change(nextProcess);
        // setAnimationsProgress(animTime);
      } else {
        if (nextProcess.changeBegan) {
          nextProcess.changeCompleted = true;
          nextProcess.changeBegan = false;
          nextProcess.changeComplete(nextProcess);
        }
      }
      nextProcess.currentTime = clamp(animTime, 0, insDuration);
      if (nextProcess.began) nextProcess.update(nextProcess);
      if (engineTime >= insDuration) {
        nextProcess.lastTime = 0;
        if (nextProcess.remainingLoops && nextProcess.remainingLoops !== true) {
          nextProcess.remainingLoops--;
        }
        if (!nextProcess.remainingLoops) {
          nextProcess.paused = true;
          if (!nextProcess.completed) {
            nextProcess.completed = true;
            nextProcess.loopComplete(nextProcess);
            nextProcess.complete(nextProcess);
            // nextProcess.resolve();
            // nextProcess.promise = makePromise(nextProcess);
          }
        } else {
          nextProcess.startTime = nextProcess.now;
          nextProcess.loopComplete(nextProcess);
          nextProcess.loopBegan = false;
          // if (nextProcess.direction === 'alternate') {
          //   toggleInstanceDirection();
          // }
        }
      }
    }
    nextProcess = nextProcess._next;
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
