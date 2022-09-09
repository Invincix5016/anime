import {
  settings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
} from './utils.js';

import {
  resetAnimationTime,
} from './animations.js';

export const engine = {
  activeProcesses: [],
  children: [],
  targets: new Map(),
  elapsedTime: 0,
}

// export const rootTargets = new Map();

const raf = requestAnimationFrame;
let engineRaf = 0;

function tickEngine(t) {
  engine.elapsedTime = t;
  let activeAnimationsLength = engine.children.length;
  let i = 0;
  while (i < activeAnimationsLength) {
    const activeAnimation = engine.children[i];
    if (!activeAnimation.paused) {
      activeAnimation.tick(t);
      i++;
    } else {
      // activeAnimation.tweens.forEach(tween => {
      for (let j = activeAnimation.tweens.length; j--;) {
        const tween = activeAnimation.tweens[j];
        const parentTargetTweens = activeAnimation.parent.targets.get(tween.target)[tween.property];
        for (let k = parentTargetTweens.length; k--;) {
          if (tween === parentTargetTweens[k]) {
            parentTargetTweens.splice(k, 1);
          }
        }
        // console.log(parentTargetTweens);
        if (tween.previous) {
          tween.previous.next = tween.next;
        }
        if (tween.next) {
          tween.next.previous = tween.previous;
        }
      }
      engine.children.splice(i, 1);

      activeAnimationsLength--;
      // console.log(engine.children.length);
    }
  }
  engineRaf = activeAnimationsLength ? raf(tickEngine) : 0;
}

export function startEngine(engine) {
  if (!engineRaf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && engine.children.length > 0) {
    engineRaf = raf(tickEngine);
  }
}

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
