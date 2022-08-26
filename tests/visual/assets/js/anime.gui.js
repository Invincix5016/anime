const classPrefix = 'anime-gui-';
const sideBarWidth = 80;
const black = '#2E2C2C';
const blackAlpha = 'rgba(46, 44, 44, .75)';

const colors = ['#FF4B4B','#FF8F42','#FFC730','#F6FF56','#A4FF4F','#18FF74','#00D672','#3CFFEC','#61C3FF','#5A87FF','#8453E3','#C26EFF','#FB89FB'];
const colorLength = colors.length;
let colorIndex = 0;

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
  }
  return color;
}

function msToEm(ms) {
  return ms / 125 + 'em';
}

function createBlock(className, css) {
  var el = document.createElement('div');
  el.classList.add(classPrefix + className);
  el.style.cssText = `
    box-sizing: border-box;
    display: flex;
    flex-shrink: 0;
    color: 'currentColor';
    ${css}
  `;
  return el;
}

function createLabel(text, css) {
  const el = createBlock('label-block', `
    position: relative;
    z-index: 1;
    align-items: center;
    height: 100%;
    padding-left: 4px;
    padding-right: 4px;
    font-size: 10px;
    font-weight: bold;
    margin-top: -.75px;
    white-space: pre;
    color: ${black};
    ${css}
  `);
  el.innerHTML = text;
  return el;
}

function createSidebarLabel(text, css) {
  const el = createBlock('sidebar-label-block', `
    position: sticky;
    z-index: 2;
    left: 0;
    justify-content: flex-end;
    width: ${sideBarWidth}px;
    align-items: center;
    height: 100%;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 12px;
    background-color: ${black};
    ${css}
  `);
  el.innerHTML = text;
  return el;
}

function createTweenBlock(offset, tween) {
  const el = createBlock('tween-line-block', `align-items: center; height: 16px;`);
  const tweenEl = createBlock('tween-block', `position: relative; height: 14px; background-color: currentColor; border-radius: 7px;`);
  const backgroundEl = createBlock('tween-background-block', `position: absolute; left: 0; top: 0; width: 100%; height: 100%; background-color: ${blackAlpha};`);
  const delayEl = createBlock('tween-delay-block', `position: relative; height: 14px;`);
  const durationEl = createBlock('tween-duration-block', `position: relative; justify-content: space-between; height: 14px; background-color: currentColor; border-radius: 7px;`);
  const endDelayEl = createBlock('tween-endDelay-block', `position: relative; height: 14px;`);
  const propertyLabelEl = createLabel(tween.property, `position: absolute; left: 0; top: 0; color: currentColor; transform: translateX(-100%)`);
  const fromValueLabelEl = createLabel(tween.from.numbers ? tween.from.numbers[0] : tween.from.number, 'text-align: left;');
  const fromToLabelEl = createLabel(tween.to.numbers ? tween.to.numbers[0] : tween.to.number, 'text-align: left;');
  durationEl.appendChild(fromValueLabelEl);
  durationEl.appendChild(fromToLabelEl);
  tweenEl.appendChild(backgroundEl);
  if (tween.delay) {
    delayEl.style.width = msToEm(tween.delay);
    tweenEl.appendChild(delayEl);
  }
  if (tween.duration) {
    durationEl.style.width = msToEm(tween.duration);
    tweenEl.appendChild(durationEl);
  }
  if (tween.endDelay) {
    endDelayEl.style.width = msToEm(tween.endDelay);
    tweenEl.appendChild(endDelayEl);
  }
  tweenEl.style.marginLeft = msToEm(offset + tween.start);
  tweenEl.appendChild(propertyLabelEl);
  el.appendChild(tweenEl);

  return el;
}

function createIterationBlock(animation) {
  const el = createBlock('iterations-block', 'align-items: center; height: 16px;');
  const iterationEls = [];
  const iterationCount = (animation.loop === true || animation.loop === Infinity) ? 1 : animation.loop;
  for (let i = 0; i < iterationCount; i++) {
    const iterationEl = createBlock('iteration-block', `justify-content: center; height: 14px; background-color: currentColor; border-radius: 7px`);
    const labelEl = createLabel('Animation ' + animation.id);
    iterationEl.appendChild(labelEl);
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
  animation.tweens.forEach((tween, i) => {
    const target = tween.target;
    const property = tween.property;
    // if (currentTarget !== target) {
    //   currentTarget = target;
    //   currentTargetColor = getTargetColor(target);
    //   const targetNameLabel = createSidebarLabel('Target ' + i, `color: ${currentTargetColor}`);
    //   el.appendChild(targetNameLabel);
    //   playHeadHeight++;
    // }
    const tweenBLockEl = createTweenBlock(animation.timelineOffset, tween);
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
  const el = createBlock('timeline', `
    position: sticky;
    z-index: 3;
    top: 0;
    align-items: center;
    height: 32px;
    min-width: calc(100% + ${sideBarWidth}px);
    width: calc(${msToEm(animation.duration)} + ${sideBarWidth}px);
    margin-left: -${sideBarWidth}px;
    margin-bottom: 2px;
    background-color: ${black};
    background-repeat: repeat-x;
    background-position: left 0px bottom 0px;
    background-size: 8em 16px, 4em 10px, .2em 4px;
    background-image: linear-gradient(to right, #FFF 1px, transparent 1px),
                      linear-gradient(to right, #FFF 1px, transparent 1px),
                      linear-gradient(to right, #FFF 1px, transparent 1px);
  `);
  const clockTimeEl = createSidebarLabel(getAnimationTime(animation), 'justify-content: flex-start; height: 16px; background-color: transparent;');
  // const animationTimeEl = createSidebarLabel(getAnimationTime(animation), `align-items: flex-end; transform: translateX(${-sideBarWidth}px);`);
  const playHead = createBlock('timeline-playhead', `
    position: absolute; top: 0; width: 1px; height: ${parentHeight}; background: currentColor;
  `);
  // el.style.width = `calc(${sideBarWidth}px + ${msToEm(animation.duration)})`;
  playHead.appendChild(clockTimeEl);
  // el.appendChild(animationTimeEl);
  el.appendChild(playHead);
  function updatePlayHeadPosition() {
    const time = getAnimationTime(animation);
    playHead.style.transform = `translateX(calc(${sideBarWidth}px + ${msToEm(animation.currentTime)}))`;
    clockTimeEl.innerHTML = time;
    // animationTimeEl.innerHTML = time + 'ms';
    requestAnimationFrame(updatePlayHeadPosition);
  }
  requestAnimationFrame(updatePlayHeadPosition);
  return el;
}

export function createGUI(animation, parentEl = document.body) {
  let width = '100%';
  let height = '50vh';
  const guiWrapperEl = createBlock('app', `
    overflow: auto;
    flex-direction: column;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: ${width};
    height: ${height};
    padding-left: ${sideBarWidth}px;
    padding-bottom: 8px;
    background-color: ${black};
    backface-visibility: hidden;
    transform: translateZ(0px);
    font-family: sans-serif;
    font-size: 10px;
    color: #FFF;
    background-repeat: repeat-x repeat-y;
    background-position: left 0px bottom 0px;
    background-size: 8em 16px, 4em 10px;
    background-attachment: local;
    background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
                      linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px);
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

  
  // const animationBlockEl = createAnimationBlock(animation);
  // guiWrapperEl.appendChild(timelineBlock.el);
  // guiWrapperEl.appendChild(animationBlockEl);
  // timelineBlock.playHeadEl.style.height = 72 + (animationBlock.playHeadHeight * 16) + 'px';
  
  parentEl.appendChild(guiWrapperEl);
}
