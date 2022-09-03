import {
  emptyString,
} from './consts.js';

import {
  cache,
} from './cache.js';

import {
  engine,
} from './engine.js';

import {
  is,
  toArray,
} from './utils.js';

function registerDomTarget(target) {
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

export function parseTargets(targets) {
  return new Set(!targets ? [] : [].concat(...(is.arr(targets) ? targets.map(toArray) : toArray(targets))));
}

export function getAnimatables(targets) {
  const parsedTargetsSet = parseTargets(targets);
  parsedTargetsSet.forEach(registerDomTarget);
  return parsedTargetsSet;
}

export function registerTargetsToMap(targets, parentMap) {
  const parsedTargetsSet = parseTargets(targets);
  const targetsMap = new Map();
  parsedTargetsSet.forEach(target => {
    registerDomTarget(target);
    let cachedTargetProperties = parentMap.get(target);
    if (!cachedTargetProperties) {
      cachedTargetProperties = {};
      parentMap.set(target, cachedTargetProperties);
    }
    targetsMap.set(target, cachedTargetProperties);
  })
  return targetsMap;
}

// Remove targets from animation

function removeTweensWithTargets(targetsSet, animation) {
  for (let i = animation.tweens.length; i--;) {
    if (targetsSet.has(animation.tweens[i].target)) {
      animation.tweens.splice(i, 1);
      animation._tweensLength--;
    }
  }
}

function removeTweensWithTargetsFromAnimation(targetsSet, animation) {
  const children = animation.children;
  for (let i = children.length; i--;) {
    const child = children[i];
    removeTweensWithTargets(targetsSet, child);
    if (!child._tweensLength && !child.children.length) children.splice(i, 1);
  }
  // Return early to prevent animations created without targets (and without tweens) to be paused
  if (!animation._tweensLength) return;
  removeTweensWithTargets(targetsSet, animation);
  if (!animation._tweensLength && !children.length) animation.pause();
}

export function removeAnimatablesFromAnimation(targets, animation) {
  const targetsSet = parseTargets(targets);
  removeTweensWithTargetsFromAnimation(targetsSet, animation);
}

export function removeAnimatablesFromActiveAnimations(targets) {
  const targetsSet = parseTargets(targets);
  for (let i = engine.activeProcesses.length; i--;) {
    const animation = engine.activeProcesses[i];
    removeTweensWithTargetsFromAnimation(targetsSet, animation);
  }
}
