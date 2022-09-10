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

export function seek(animation, time, muteCallbacks, isSeekingBackwards) {
  if (muteCallbacks) {
    if (animation.children) {
      syncAnimationChildren(animation, time, muteCallbacks);
    }
    renderAnimationTweens(animation, time, isSeekingBackwards);
  } else {
    setAnimationProgress(animation, getAdjustedAnimationTime(animation, time), isSeekingBackwards);
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
  engine.children.push(animation);
  resetAnimationTime(animation);
  startEngine(engine);
  return animation;
}

export function reverse(animation) {
  toggleAnimationDirection(animation);
  animation.completed = animation.isReversed ? 0 : 1;
  return resetAnimationTime(animation);
}

export function restart(animation) {
  resetAnimation(animation);
  return play(animation);
}
