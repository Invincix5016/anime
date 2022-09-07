const classPrefix = 'anime-gui-';
const sideBarWidth = 80;
const blackColor = '#2E2C2C';
const whiteColor = '#F6F4F2';
const blackAlpha = 'rgba(46, 44, 44, .65)';

const colors = ['#FF4B4B','#FF8F42','#FFC730','#F6FF56','#A4FF4F','#18FF74','#00D672','#3CFFEC','#61C3FF','#5A87FF','#8453E3','#C26EFF','#FB89FB'];
const colorLength = colors.length;
let colorIndex = 0;

function createCssRules() {
  const styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  const styleSheet = styleEl.sheet;
  styleSheet.insertRule(`
    .${classPrefix}wrapper,.${classPrefix}wrapper *,.${classPrefix}wrapper *:before,.${classPrefix}wrapper *:after {
      box-sizing: border-box;
      display: flex;
      flex-shrink: 0;
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}wrapper {
      overflow: auto;
      flex-direction: column;
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      padding-left: ${sideBarWidth}px;
      padding-bottom: 8px;
      background-color: ${blackColor};
      font-family: sans-serif;
      font-size: 10px;
      color: ${whiteColor};
      backface-visibility: hidden;
      background-repeat: repeat-x repeat-y;
      background-position: left 0px bottom 0px;
      background-size: 8em 16px, 4em 10px;
      background-attachment: local;
      background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
                        linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px);
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}timeline {
      position: sticky;
      z-index: 3;
      top: 0;
      align-items: flex-start;
      min-width: calc(100% + ${sideBarWidth}px);
      height: 32px;
      margin-left: -${sideBarWidth}px;
      margin-bottom: 2px;
      padding-left: ${sideBarWidth}px;
      background-color: ${blackColor};
      background-repeat: repeat-x;
      background-position: left 0px bottom 0px;
      background-size: 8em 10px, 4em 7px, .2em 4px;
      background-image: linear-gradient(to right, ${whiteColor} 1px, transparent 1px),
                        linear-gradient(to right, ${whiteColor} 1px, transparent 1px),
                        linear-gradient(to right, ${whiteColor} 1px, transparent 1px);
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}label-block {
      z-index: 1;
      align-items: center;
      height: 100%;
      margin-top: 0px;
      padding-left: 4px;
      padding-right: 4px;
      font-size: 10px;
      font-weight: bold;
      white-space: pre;
      color: ${blackColor};
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}scrubber {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}scrubber:focus {
      outline: none;
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}scrubber::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 64px;
      height: 20px;
      border-radius: 10px;
      background-color: ${whiteColor};
    }
  `);
  styleSheet.insertRule(`
    .${classPrefix}scrubber::-webkit-slider-thumb {
      -webkit-appearance: none;
    }
  `);
}

function getColor() {
  const color = colors[colorIndex++];
  if (colorIndex > colorLength - 1) {
    colorIndex = 0;
  }
  return color;
}

let targetColors = new Map();

function getTargetColor(target) {
  let color = targetColors.get(target);
  if (!color) {
    color = getColor();
    targetColors.set(target, color);
    target.style.boxShadow = `0 0 0 4px ${blackColor}, 0 0 0 8px ${color}`;
  }
  return color;
}

function msToEm(ms) {
  return ms / 125 + 'em';
}

function createBlock(className, css) {
  var el = document.createElement('div');
  el.classList.add(classPrefix + 'block');
  el.classList.add(classPrefix + className);
  el.style.cssText = css;
  return el;
}

function createLabel(text, css) {
  const el = createBlock('label-block', css);
  el.innerHTML = text;
  return el;
}

function createSidebarLabel(text, css) {
  const el = createBlock('sidebar-label-block', css);
  el.innerHTML = text;
  return el;
}

function createTweenBlock(offset, tween, color, previousTweenEl) {
  const el = createBlock('tween-line-block', `position: relative; align-items: center; height: 16px;`);
  const tweenEl = createBlock('tween-block', `position: relative; height: 14px; background-color: currentColor; border-radius: 7px;`);
  const backgroundEl = createBlock('tween-background-block', `position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: ${blackAlpha};`);
  const delayEl = createBlock('tween-delay-block', `position: relative; height: 14px;`);
  const durationEl = createBlock('tween-duration-block', `position: relative; justify-content: space-between; height: 14px; background-color: currentColor; border-radius: 7px;`);
  const skippedDurationEl = createBlock('tween-skipped-duration-block', `position: absolute; top: 0; right: 0; height: 14px; background: repeating-linear-gradient(45deg,transparent,transparent 1.5px,${blackColor} 1.5px,${blackColor} 3px); border-radius: 0px 7px 7px 0px;`);
  const endDelayEl = createBlock('tween-endDelay-block', `position: relative; height: 14px;`);
  const idEl = createLabel(tween.id, `position: absolute; left: 0; right: 0; text-align: center; display: flex; justify-content: center`);
  const fromValueLabelEl = createLabel(tween.from.numbers ? tween.from.numbers[0] : tween.from.number, `padding-right: 1px;`);
  const fromToLabelEl = createLabel(tween.to.numbers ? tween.to.numbers[0] : tween.to.number, `padding-left: 1px; text-shadow: -1px -1px 0 ${color}, 1px -1px 0 ${color}, -1px 1px 0 ${color}, 1px 1px 0 ${color};`);
  // durationEl.appendChild(fromValueLabelEl);
  durationEl.appendChild(idEl);
  // durationEl.appendChild(fromToLabelEl);
  tweenEl.appendChild(backgroundEl);
  if (tween.delay) {
    delayEl.style.width = msToEm(tween.delay);
    tweenEl.appendChild(delayEl);
  }
  if (tween.changeDuration) {
    durationEl.style.width = msToEm(tween.updateDuration);
    skippedDurationEl.style.width = msToEm(tween.updateDuration - tween.changeDuration);
    durationEl.appendChild(skippedDurationEl);
    tweenEl.appendChild(durationEl);
  }
  if (tween.endDelay) {
    endDelayEl.style.width = msToEm(tween.endDelay);
    tweenEl.appendChild(endDelayEl);
  }
  if (!previousTweenEl) {
    tweenEl.style.marginLeft = msToEm(offset + tween.start);
    const propertyLabelEl = createLabel(tween.property, `position: absolute; left: 0; top: 0; color: currentColor; transform: translateX(-100%)`);
    tweenEl.appendChild(propertyLabelEl);
    el.appendChild(tweenEl);
    return el;
  } else {
    previousTweenEl.appendChild(tweenEl);
    return previousTweenEl;
  }
}

function createIterationBlock(animation) {
  const el = createBlock('iterations-block', 'align-items: center; height: 16px;');
  const iterationEls = [];
  const iterationCount = (animation.loop === true || animation.loop === Infinity) ? 1 : animation.loop;
  for (let i = 0; i < iterationCount; i++) {
    const iterationEl = createBlock('iteration-block', `position: relative; height: 14px; background-color: currentColor; border-radius: 0px;`);
    const backgroundEl = createBlock('iteration-background-block', `position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: ${blackAlpha};`);
    const delayEl = createBlock('iteration-delay-block', `position: relative; height: 14px;`);
    const durationEl = createBlock('iteration-duration-block', `position: relative; justify-content: space-between; height: 14px; background-color: currentColor; border-radius: 0px;`);
    const endDelayEl = createBlock('iteration-endDelay-block', `position: relative; height: 14px;`);
    const labelEl = createLabel('Animation ' + animation.id, `position: absolute; left: 0; top: 0; color: currentColor; transform: translateX(-100%)`);
    iterationEl.appendChild(backgroundEl);
    iterationEl.appendChild(labelEl);
    if (animation._changeStartTime) {
      delayEl.style.width = msToEm(animation._changeStartTime);
      iterationEl.appendChild(delayEl);
    }
    const changeDuration = animation._changeEndTime - animation._changeStartTime;
    durationEl.style.width = msToEm(changeDuration);
    iterationEl.appendChild(durationEl);
    if (animation._changeEndTime) {
      endDelayEl.style.width = msToEm(changeDuration - animation._changeEndTime);
      iterationEl.appendChild(endDelayEl);
    }
    el.appendChild(iterationEl);
    iterationEls.push(iterationEl);
  }
  iterationEls[0].style.marginLeft = msToEm(animation.timelineOffset);
  iterationEls.forEach(el => el.style.width = msToEm(animation.duration * iterationCount));
  return el;
}

function createAnimationBlock(animation) {
  const color = getColor();
  const el = createBlock('animation-block', `flex-direction: column; color: ${color};`);
  const iterationBLockEl = createIterationBlock(animation);
  el.appendChild(iterationBLockEl);
  let playHeadHeight = 0;
  let currentTarget;
  let currentProperty;
  let currentTargetColor;
  let previousTargetTweenEl;
  animation.tweens.forEach((tween, i) => {
    const target = tween.target;
    const property = tween.property;
    let hasPreviousTween = property === currentProperty;
    if (currentTarget !== target) {
      currentTarget = target;
      currentTargetColor = getTargetColor(target);
      // const targetNameLabel = createSidebarLabel('Target ' + i, `color: ${currentTargetColor}`);
      // el.appendChild(targetNameLabel);
      // playHeadHeight++;
    }
    const tweenBLockEl = createTweenBlock(animation.timelineOffset, tween, currentTargetColor, hasPreviousTween ? previousTargetTweenEl : false);
    previousTargetTweenEl = tweenBLockEl;
    currentProperty = property;
    tweenBLockEl.style.color = currentTargetColor;
    el.appendChild(tweenBLockEl);
    playHeadHeight++;
  });
  return el;
}

function getAnimationTime(animation) {
  return (Math.round(animation.currentTime * 1) / 1);
}

function createTimelineBlock(animation, parentHeight) {
  const el = createBlock('timeline', `width: calc(${msToEm(animation.duration)} + ${sideBarWidth}px);`);
  const clockTimeEl = createBlock('clock-time', `
    pointer-events: none;
    position: relative;
    left: 0;
    z-index: 2;
    justify-content: center;
    align-items: center;
    width: 64px;
    height: 20px;
    margin-left: -32px;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 12px;
    color: ${blackColor};
    background-color: transparent;
  `);
  const playHead = createBlock('timeline-playhead', `
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: ${parentHeight};
    background: currentColor;
  `);
  const scrubberEl = document.createElement('input');
  scrubberEl.classList.add(`${classPrefix}scrubber`)
  scrubberEl.setAttribute('type', 'range');
  scrubberEl.setAttribute('step', 10/animation.duration);
  scrubberEl.setAttribute('min', '0');
  scrubberEl.setAttribute('max', '1');
  scrubberEl.setAttribute('value', '0');
  scrubberEl.style.width = `calc(${msToEm(animation.duration)} + 64px)`;
  scrubberEl.style.marginLeft = '-32px';

  scrubberEl.onmousedown = function() {
    animation.pause();
  };

  scrubberEl.oninput = function() {
    animation.seek(animation.duration * (scrubberEl.value));
  };

  // el.style.width = `calc(${sideBarWidth}px + ${msToEm(animation.duration)})`;
  playHead.appendChild(clockTimeEl);
  // el.appendChild(animationTimeEl);
  el.appendChild(playHead);
  el.appendChild(scrubberEl);
  function updatePlayHeadPosition() {
    requestAnimationFrame(updatePlayHeadPosition);
    const time = getAnimationTime(animation);
    playHead.style.transform = `translateX(calc(${sideBarWidth}px + ${msToEm(animation.currentTime)}))`;
    clockTimeEl.innerHTML = time;
    // animationTimeEl.innerHTML = time + 'ms';
    scrubberEl.value = animation.progress;
  }
  requestAnimationFrame(updatePlayHeadPosition);
  return el;
}

export function createGUI(animation, parentEl = document.body) {
  let width = '100%';
  let height = '50vh';
  const guiWrapperEl = createBlock('wrapper', `
    width: ${width};
    height: ${height};
  `);

  parentEl.style.paddingBottom = height;

  const timelineBlockEl = createTimelineBlock(animation, height);
  guiWrapperEl.appendChild(timelineBlockEl);

  if (animation.children.length) {
    animation.children.forEach(childAnimation => {
      const animationBlockEl = createAnimationBlock(childAnimation);
      guiWrapperEl.appendChild(animationBlockEl);
    });
  } else {
    const animationBlockEl = createAnimationBlock(animation);
    guiWrapperEl.appendChild(animationBlockEl);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code == 'Space') {
      e.preventDefault();
      if (animation.paused) {
        animation.play()
      } else {
        animation.pause();
      }
    }
  });

  createCssRules();

  parentEl.appendChild(guiWrapperEl);
}
