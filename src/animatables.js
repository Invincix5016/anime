import {
  emptyString,
} from './consts.js';

import {
  cache,
} from './cache.js';

import {
  is,
  flattenArray,
  filterArray,
  arrayContains,
  toArray,
} from './utils.js';

import {
  activeInstances,
} from './engine.js';

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

export function getAnimatables(targets) {
  const parsed = parseTargets(targets);
  const total = parsed.length;
  return parsed.map(registerTarget);
}

// Remove targets from animation

function removeTweensWithTargets(targetsArray, tweens) {
  for (let i = tweens.length; i--;) {
    if (arrayContains(targetsArray, tweens[i].target)) {
      tweens.splice(i, 1);
    }
  }
}

function removeAnimationsWithTargetsFromIntance(targetsArray, instance) {
  const tweens = instance.tweens;
  const children = instance.children;
  for (let i = children.length; i--;) {
    const child = children[i];
    const childTweens = child.tweens;
    removeTweensWithTargets(targetsArray, childTweens);
    if (!childTweens.length && !child.children.length) children.splice(i, 1);
  }
  // Return early to prevent instances created without targets (and without tweens) to be paused
  if (!tweens.length) return;
  removeTweensWithTargets(targetsArray, tweens);
  if (!tweens.length && !children.length) instance.pause();
}

export function removeAnimatablesFromInstance(targets, instance) {
  const targetsArray = parseTargets(targets);
  removeAnimationsWithTargetsFromIntance(targetsArray, instance);
}

export function removeAnimatablesFromActiveInstances(targets) {
  const targetsArray = parseTargets(targets);
  for (let i = activeInstances.length; i--;) {
    const instance = activeInstances[i];
    removeAnimationsWithTargetsFromIntance(targetsArray, instance);
  }
}
