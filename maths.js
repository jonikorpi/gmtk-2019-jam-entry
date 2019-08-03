import random from "./random";

export const createRNG = args => new random("vuoro", ...args);

export const deduplicateBy = by => (item, index, list) =>
  index === list.findIndex(found => found[by] === item[by]);
export const deduplicate = (item, index, list) => index === list.indexOf(item);

export const mapBy = by => (map, item) => {
  map[item[by]] = item;
  return map;
};

export const clamp = (value, from = -1, to = 1) =>
  Math.min(to, Math.max(from, value));

export const normalize = vector => {
  const sum = vector.reduce((total, value) => total + value * value, 0);
  const normal = Math.sqrt(sum);
  return normal === 0
    ? vector.map(value => 0)
    : vector.map(value => value / normal);
};

export const lerp = (from, to, time) => from * (1 - time) + to * time;
// https://chicounity3d.wordpress.com/2014/05/23/how-to-lerp-like-a-pro/
// Ease-out
export const sinerp = (from, to, time) =>
  lerp(from, to, Math.sin(time * Math.PI * 0.5));
// Ease-in
export const coserp = (from, to, time) =>
  lerp(from, to, 1 - Math.cos(time * Math.PI * 0.5));
// Glides to a stop
export const experp = (from, to, time) => lerp(from, to, time * time);
// Ease-in-out
export const smoothStep = (from, to, time) =>
  lerp(from, to, time * time * (3 - 2 * time));
// Ease-in-out smoother
export const smootherStep = (from, to, time) =>
  lerp(from, to, time * time * time * (time * (6 * time - 15) + 10));
// Best for zooming
// https://www.gamasutra.com/blogs/ScottLembcke/20180418/316665/Logarithmic_Interpolation.php
// https://www.gamedev.net/forums/topic/666225-equation-for-zooming/
export const logerp = (from, to, time) =>
  Math.exp(
    lerp(Math.log(from + Number.EPSILON), Math.log(to + Number.EPSILON), time)
  );

// https://gist.github.com/shaunlebron/8832585
export const shortAngleDist = (from, to) => {
  const max = Math.PI * 2;
  const da = (to - from) % max;
  return ((2 * da) % max) - da;
};
export const angleLerp = (from, to, time) =>
  from + shortAngleDist(from, to) * time;

// https://gist.github.com/gre/1650294#gistcomment-2036299
export const easeIn = p => t => Math.pow(t, p);
export const easeOut = p => t => 1 - Math.abs(Math.pow(t - 1, p));
export const easeInOut = p => t =>
  t < 0.5 ? easeIn(p)(t * 2) / 2 : easeOut(p)(t * 2 - 1) / 2 + 0.5;

export const easeInSin = t => 1 + Math.sin((Math.PI / 2) * t - Math.PI / 2);
export const easeOutSin = t => Math.sin((Math.PI / 2) * t);
export const easeInOutSin = t => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;

// https://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d/2259502#2259502
export const rotateAround = (point, angle, around) => {
  let [px, py] = point;
  const [x, y] = around;
  const radians = toRadians(angle);
  const s = Math.sin(radians);
  const c = Math.cos(radians);

  // translate point back to origin:
  px -= x;
  py -= y;

  // rotate point
  const xnew = px * c - py * s;
  const ynew = px * s + py * c;

  // translate point back:
  px = xnew + x;
  py = ynew + y;

  return [px, py];
};

export const toDegrees = radians => radians * (180 / Math.PI);
export const toRadians = degrees => degrees * (Math.PI / 180);

export const rotateArray = (array, times) => {
  if (times < 0) {
    throw new Error("can't rotate backwards");
  }

  while (times--) {
    array.push(array.shift());
  }

  return array;
};
