import {
  settings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
} from './utils.js';

export const activeAnimations = [];

export const engine = {
  activeProcesses: [],
  raf: 0,
  currentTime: 0,
}

function tick(t) {
  // memo on algorithm issue:
  // dangerous iteration over mutable `activeAnimations`
  // (that collection may be updated from within callbacks of `tick`-ed animation instances)
  let activeAnimationsLength = activeAnimations.length;
  let i = 0;
  while (i < activeAnimationsLength) {
    const activeInstance = activeAnimations[i];
    if (!activeInstance.paused) {
      activeInstance.tick(t);
      i++;
    } else {
      activeAnimations.splice(i, 1);
      activeAnimationsLength--;
    }
  }
  engine.raf = i > 0 ? requestAnimationFrame(tick) : undefined;
}

export function startEngine() {
  if (!engine.raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && activeAnimations.length > 0) {
    engine.raf = requestAnimationFrame(tick);
  }
}


function handleVisibilityChange() {
  if (!settings.suspendWhenDocumentHidden) return;

  if (isDocumentHidden()) {
    // suspend ticks
    engine.raf = cancelAnimationFrame(engine.raf);
  } else {
    // is back to active tab
    // first adjust animations to consider the time that ticks were suspended
    activeAnimations.forEach(
      instance => instance ._onDocumentVisibility()
    );
    startEngine();
  }
}

if (isBrowser) {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}
