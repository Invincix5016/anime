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
  elapsedTime: 0,
}

// export const rootTargets = new Map();

const raf = requestAnimationFrame;
let engineRaf = 0;

function tickEngine(t) {
  engine.elapsedTime = t;
  let activeProcessesLength = engine.children.length;
  let i = 0;
  while (i < activeProcessesLength) {
    const activeAnimation = engine.children[i];
    if (!activeAnimation.paused) {
      activeAnimation.tick(t);
      i++;
    } else {
      engine.children.splice(i, 1);
      activeProcessesLength--;
    }
  }
  engineRaf = activeProcessesLength ? raf(tickEngine) : 0;
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
