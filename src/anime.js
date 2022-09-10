import {
  settings,
} from './consts.js';

import {
  clamp,
  random,
} from './utils.js';

import {
  parseEasings,
  penner,
} from './easings.js';

import {
  convertValueUnit,
} from './units.js';

import {
  getTargetValue,
} from './values.js';

import {
  setDashoffset,
  getPath,
} from './svg.js';

import {
  parseTargets,
  removeTweensWithTargetsFromAnimation,
} from './animatables.js';

import {
  engine,
} from './engine.js';

import {
  animate,
} from './animate.js';

import {
  createTimeline,
} from './timelines.js';

import {
  stagger,
} from './stagger.js';


const anime = animate;

anime.version = '__packageVersion__';
anime.speed = 1;
anime.settings = settings;
anime.engine = engine;
anime.suspendWhenDocumentHidden = true;
anime.running = engine.children;
anime.remove = targets => { const targetsSet = parseTargets(targets); for (let i = engine.children.length; i--;) removeTweensWithTargetsFromAnimation(targetsSet, engine.children[i]); }
anime.get = getTargetValue;
anime.set = (targets, props = {}) => { props.targets = targets; props.duration = 0; return animate(props); };
anime.convertPx = convertValueUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = createTimeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.clamp = clamp;
anime.random = random;

export default anime;
