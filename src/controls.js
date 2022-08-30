import {
  syncAnimationChildren,
  renderAnimationTweens,
  setAnimationProgress,
  getAdjustedAnimationTime,
  resetAnimationTime,
  resetAnimation,
  toggleAnimationDirection,
} from './animations.js';

import {
  engine,
  startEngine,
} from './engine.js';

export function seek(animation, time, muteCallbacks) {
  if (muteCallbacks) {
    if (animation.children) {
      syncAnimationChildren(animation, time, 1);
    }
    renderAnimationTweens(animation, time);
  } else {
    setAnimationProgress(animation, getAdjustedAnimationTime(animation, time), 1);
  }
  return animation;
}

export function pause(animation) {
  animation.paused = 1;
  return resetAnimationTime(animation);
}

export function play(animation) {
  if (!animation.paused) return animation;
  if (animation.completed) resetAnimation(animation);
  animation.paused = 0;
  engine.activeProcesses.push(animation);
  resetAnimationTime(animation);
  startEngine(engine);
  return animation;
}

export function reverse(animation) {
  toggleAnimationDirection(animation);
  animation.completed = animation._isReversed ? 0 : 1;
  return resetAnimationTime(animation);
}

export function restart(animation) {
  resetAnimation(animation);
  return play(animation);
}
