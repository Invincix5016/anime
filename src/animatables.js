import {
  emptyString,
} from './consts.js';

import {
  cache,
} from './cache.js';

import {
  activeAnimations,
} from './engine.js';

import {
  is,
  flattenArray,
  filterArray,
  arrayContains,
  toArray,
} from './utils.js';

function registerTarget(target) {
  if (!is.dom(target)) return target;
  let cachedTarget = cache.DOM.get(target);
  if (!cachedTarget) {
    cachedTarget = {
      transforms: {},
      isSVG: is.svg(target)
    };
    cache.DOM.set(target, cachedTarget);
  }
  return target;
}

function parseTargets(targets) {
  const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, (item, pos, self) => self.indexOf(item) === pos);
}

export function getTargets(targets) {
  const parsed = parseTargets(targets);
  const total = parsed.length;
  return parsed.map(registerTarget);
}

// Remove targets from animation

function removeTweensWithTargets(targetsArray, tweensArray) {
  for (let i = tweensArray.length; i--;) {
    if (arrayContains(targetsArray, tweensArray[i].target)) {
      tweensArray.splice(i, 1);
    }
  }
}

function removeTweensWithTargetsFromAnimation(targetsArray, animation) {
  const tweens = animation.tweens;
  const children = animation.children;
  for (let i = children.length; i--;) {
    const child = children[i];
    const childTweens = child.tweens;
    removeTweensWithTargets(targetsArray, childTweens);
    if (!childTweens.length && !child.children.length) children.splice(i, 1);
  }
  // Return early to prevent animations created without targets (and without tweens) to be paused
  if (!tweens.length) return;
  removeTweensWithTargets(targetsArray, tweens);
  if (!tweens.length && !children.length) animation.pause();
}

export function removeAnimatablesFromAnimation(targets, animation) {
  const targetsArray = parseTargets(targets);
  removeTweensWithTargetsFromAnimation(targetsArray, animation);
}

export function removeAnimatablesFromActiveAnimations(targets) {
  const targetsArray = parseTargets(targets);
  for (let i = activeAnimations.length; i--;) {
    const animation = activeAnimations[i];
    removeTweensWithTargetsFromAnimation(targetsArray, animation);
  }
}
