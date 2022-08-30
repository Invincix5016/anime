import {
  settings,
  minValue,
} from './consts.js';

import {
  createAnimation,
  resetAnimation,
  setAnimationProgress,
} from './animations.js';

import {
  seek,
  pause,
  play,
  reverse,
  restart,
} from './controls.js';

import {
  removeAnimatablesFromAnimation,
} from './animatables.js';

export function animate(params = {}) {
  const animation = createAnimation(params);

  animation.reset = () => resetAnimation(animation);
  animation.seek = (time, muteCallbacks) => seek(animation, time, muteCallbacks);
  animation.pause = () => pause(animation);
  animation.play = () => play(animation);
  animation.reverse = () => reverse(animation);
  animation.restart = () => restart(animation);
  animation.remove = (targets) => removeAnimatablesFromAnimation(targets, animation);

  animation.tick = function(t) {
    animation._parentCurrentTime = t;
    if (!animation._startTime) animation._startTime = animation._parentCurrentTime;
    setAnimationProgress(animation, (animation._parentCurrentTime + (animation._lastCurrentTime - animation._startTime)) * settings.speed);
  }

  if (animation.autoplay) {
    if (animation.duration === minValue) {
      animation.seek(minValue);
    } else {
      animation.play();
    }
  }

  return animation;
}
