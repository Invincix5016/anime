import {
  resetAnimationTime,
  resetAnimation,
  toggleAnimationDirection,
} from './animations.js';

import {
  engine,
  startEngine,
} from './engine.js';

export function pause(animation) {
  animation.paused = 1;
  return resetAnimationTime(animation);
}

export function play(animation) {
  if (!animation.paused) return animation;
  if (animation.completed) resetAnimation(animation);
  animation.paused = 0;
  engine.children.push(animation);
  engine.activeAnimationsLength++;
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
