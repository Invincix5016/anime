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

// export function registerTargetsToMap(targets, parentMap) {
//   const targetsArray = is.arr(targets) ? targets.map(toArray) : toArray(targets);
//   const targetsMap = new Map();
//   let cachedTargetProperties;
//   for (let i = 0, l = targetsArray.length; i < l; i++) {
//     const target = targetsArray[i];
//     if (is.arr(target)) {
//       for (let j = 0, jl = target.length; j < jl; j++) {
//         const subTarget = target[j];
//         cachedTargetProperties = parentMap.get(subTarget);
//         if (!cachedTargetProperties) {
//           cachedTargetProperties = {};
//           parentMap.set(subTarget, cachedTargetProperties);
//         }
//         targetsMap.set(subTarget, cachedTargetProperties);
//       }
//     } else {
//       cachedTargetProperties = parentMap.get(target);
//       if (!cachedTargetProperties) {
//         cachedTargetProperties = {};
//         parentMap.set(target, cachedTargetProperties);
//       }
//       targetsMap.set(target, cachedTargetProperties);
//     }
//   }
//   return targetsMap;
// }

// Remove targets from animation

function removeTweensWithTargets(targetsSet, tweensArray) {
  for (let i = tweensArray.length; i--;) {
    if (targetsSet.has(tweensArray[i].target)) {
      tweensArray.splice(i, 1);
    }
  }
}

function removeTweensWithTargetsFromAnimation(targetsSet, animation) {
  const tweens = animation.tweens;
  const children = animation.children;
  for (let i = children.length; i--;) {
    const child = children[i];
    const childTweens = child.tweens;
    removeTweensWithTargets(targetsSet, childTweens);
    if (!childTweens.length && !child.children.length) children.splice(i, 1);
  }
  // Return early to prevent animations created without targets (and without tweens) to be paused
  if (!tweens.length) return;
  removeTweensWithTargets(targetsSet, tweens);
  if (!tweens.length && !children.length) animation.pause();
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
