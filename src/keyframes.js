import {
  is,
  mergeObjects,
} from './utils.js';

import {
  springTestRgx,
} from './consts.js';

import {
  spring,
} from './easings.js';

export function convertPropertyValueToKeyframes(property, propertyValue, duration, delay, endDelay, easing, round) {
  let value = propertyValue;
  const settings = { property, duration, delay, endDelay, easing, round };
  // Override duration if easing is a spring
  if (springTestRgx.test(easing)) {
    settings.duration = spring(easing);
  }
  if (is.arr(value)) {
    const l = value.length;
    const isFromTo = (l === 2 && !is.obj(value[0]));
    if (!isFromTo) {
      // In case of a keyframes array, duration is divided by the number of tweens
      if (!is.fnc(duration)) {
        settings.duration = duration / l;
      }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      value = { value: value };
    }
  }
  const valuesArray = is.arr(value) ? value : [value];
  return valuesArray.map((v, i) => {
    const obj = (is.obj(v) && !v.isPath) ? v : { value: v };
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) {
      obj.delay = !i ? delay : 0;
    }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === valuesArray.length - 1 ? endDelay : 0;
    }
    return obj;
  }).map(k => mergeObjects(k, settings));
}


export function flattenParamsKeyframes(keyframes) {
  const properties = {};
  const propertyNames = keyframes.map(key => Object.keys(key)).filter(is.key).reduce((a,b) => {
    if (a.indexOf(b) < 0) { a.push(b); };
    return a;
  }, []);
  for (let i = 0, l = propertyNames.length; i < l; i++) {
    const propName = propertyNames[i];
    properties[propName] = keyframes.map(key => {
      const newKey = {};
      for (let p in key) {
        if (is.key(p)) {
          if (p == propName) {
            newKey.value = key[p];
          }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  }
  return properties;
}
