import {
  settings,
} from './consts.js';

import {
  isBrowser,
  isDocumentHidden,
} from './utils.js';

export const activeAnimations = [];

let raf;

function tick(t) {
  // memo on algorithm issue:
  // dangerous iteration over mutable `activeAnimations`
  // (that collection may be updated from within callbacks of `tick`-ed animation instances)
  let activeAnimationsLength = activeAnimations.length;
  let i = 0;
  while (i < activeAnimationsLength) {
    const activeAnimation = activeAnimations[i];
    if (!activeAnimation.paused) {
      activeAnimation.tick(activeAnimation, t);
      i++;
    } else {
      activeAnimations.splice(i, 1);
      activeAnimationsLength--;
    }
  }
  raf = i > 0 ? requestAnimationFrame(tick) : undefined;
}

export function startEngine() {
  if (!raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && activeAnimations.length > 0) {
    raf = requestAnimationFrame(tick);
  }
}


function handleVisibilityChange() {
  if (!settings.suspendWhenDocumentHidden) return;

  if (isDocumentHidden()) {
    // suspend ticks
    raf = cancelAnimationFrame(raf);
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
