import {
  settings,
  minValue,
} from './consts.js';

import {
  seekAnimation,
  tickAnimation,
  createAnimation,
  resetAnimation,
  setAnimationProgress,
} from './animations.js';

import {
  pause,
  play,
  reverse,
  restart,
} from './controls.js';

import {
  removeAnimatablesFromAnimation,
} from './animatables.js';

export function animate(params = {}, parent) {
  const animation = createAnimation(params, parent);

  animation.reset = () => resetAnimation(animation);
  animation.seek = (time, muteCallbacks, isSeekingBackwards) => seekAnimation(animation, time, muteCallbacks, isSeekingBackwards);
  animation.pause = () => pause(animation);
  animation.play = () => play(animation);
  animation.reverse = () => reverse(animation);
  animation.restart = () => restart(animation);
  animation.remove = (targets) => removeAnimatablesFromAnimation(targets, animation);
  animation.tick = (t) => tickAnimation(animation, t);

  if (animation.autoplay) {
    if (animation.duration === minValue) {
      seekAnimation(animation, minValue);
    } else {
      play(animation);
    }
  }

  return animation;
}
