import {
  is,
  mergeObjects,
  filterArray,
} from './utils.js';

import {
  springTestRgx,
} from './consts.js';

import {
  spring,
} from './easings.js';

function convertPropertyValueToTweens(propertyName, propertyValue, tweenSettings) {
  let value = propertyValue;
  const settings = {...tweenSettings};
  settings.property = propertyName;
  // Override duration if easing is a spring
  if (springTestRgx.test(settings.easing)) {
    settings.duration = spring(settings.easing);
  }
  if (is.arr(value)) {
    const l = value.length;
    const isFromTo = (l === 2 && !is.obj(value[0]));
    if (!isFromTo) {
      // In case of a keyframes array, duration is divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) {
        settings.duration = tweenSettings.duration / l;
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
      obj.delay = !i ? tweenSettings.delay : 0;
    }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) {
      obj.endDelay = i === valuesArray.length - 1 ? tweenSettings.endDelay : 0;
    }
    return obj;
  }).map(k => mergeObjects(k, settings));
}


function flattenParamsKeyframes(keyframes) {
  const properties = {};
  const keyframesArray = keyframes.map(key => Object.keys(key));
  const propertyNames = filterArray(keyframesArray, p => is.key(p))
  .reduce((a,b) => {
    if (a.indexOf(b) < 0) {
      a.push(b);
    }
    return a;
  }, []);
  for (let i = 0; i < propertyNames.length; i++) {
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

function getKeyframesFromProperties(tweenSettings, params) {
  const keyframes = [];
  const paramsKeyframes = params.keyframes;
  if (paramsKeyframes) {
    params = mergeObjects(flattenParamsKeyframes(paramsKeyframes), params);;
  }
  for (let p in params) {
    if (is.key(p)) {
      keyframes.push(convertPropertyValueToTweens(p, params[p], tweenSettings));
    }
  }
  return keyframes;
}

export {
  getKeyframesFromProperties
}
