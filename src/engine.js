import {
  settings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
} from './utils.js';

import {
  tickAnimation,
  resetAnimationTime,
} from './animations.js';

export const engine = {
  children: [],
  targets: new Map(),
  activeAnimationsLength: 0,
}

// export const rootTargets = new Map();

const raf = requestAnimationFrame;
let engineRaf = 0;

engine.tick = function(t) {
  engine.activeAnimationsLength = engine.children.length;
  let i = 0;
  while (i < engine.children.length) {
    const activeAnimation = engine.children[i];
    if (!activeAnimation.paused) {
      tickAnimation(activeAnimation, t);
      i++;
    } else {
      // TODO: Check if we should re-add the tweens on play/pause
      for (let j = activeAnimation.tweens.length; j--;) {
        const tween = activeAnimation.tweens[j];
        const parentTargetTweens = activeAnimation.parent.targets.get(tween.target)[tween.property];
        for (let k = parentTargetTweens.length; k--;) {
          if (tween === parentTargetTweens[k]) {
            parentTargetTweens.splice(k, 1);
          }
        }
        if (tween.previous) tween.previous.next = tween.next;
        if (tween.next) tween.next.previous = tween.previous;
      }
      engine.children.splice(i, 1);
      engine.activeAnimationsLength--;
    }
  }
}

function mainLoop(t) {
  engine.tick(t);
  engineRaf = engine.activeAnimationsLength ? raf(mainLoop) : 0;
}

export function startEngine(engine) {
  if (settings.useDefaultAnimationLoop && (!engineRaf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && engine.activeAnimationsLength > 0)) {
    engineRaf = raf(mainLoop);
  }
}

let io = 0;

function handleVisibilityChange() {
  if (!settings.suspendWhenDocumentHidden) return;
  if (isDocumentHidden()) {
    // suspend ticks
    engineRaf = cancelAnimationFrame(engineRaf);
  } else {
    // is back to active tab
    // first adjust animations to consider the time that ticks were suspended
    engine.children.forEach(resetAnimationTime);
    startEngine(engine);
  }
}

if (isBrowser) {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
