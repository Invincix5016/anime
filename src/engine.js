import {
  settings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
} from './utils.js';

export const engine = {
  activeProcesses: [],
  elapsedTime: 0,
}

let engineRaf = 0;

function tickEngine(t) {
  engine.elapsedTime = t;
  let activeProcessesLength = engine.activeProcesses.length;
  let i = 0;
  while (i < activeProcessesLength) {
    const activeInstance = engine.activeProcesses[i];
    if (!activeInstance.paused) {
      activeInstance.tick(t);
      i++;
    } else {
      engine.activeProcesses.splice(i, 1);
      activeProcessesLength--;
    }
  }
  engineRaf = activeProcessesLength ? requestAnimationFrame(tickEngine) : 0;
}

export function startEngine(engine) {
  if (!engineRaf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && engine.activeProcesses.length > 0) {
    engineRaf = requestAnimationFrame(tickEngine);
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
    engine.activeProcesses.forEach(
      instance => instance._onDocumentVisibility()
    );
    startEngine(engine);
  }
}

if (isBrowser) {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
