import {
  valueTypes,
} from '../src/consts.js';

const colors = {
  from: {
    rgb: {
      input: {
        HEX3: '#f99',
        HEX6: '#ff9999',
        RGB: 'rgb(255, 153, 153)',
        HSL: 'hsl(0, 100%, 80%)',
      },
      output: [255, 153, 153, 1]
    },
    rgba: {
      input: {
        HEX3A: '#f999',
        HEX6A: '#ff999999',
        RGBA: 'rgba(255, 153, 153, .6)',
        HSLA: 'hsla(0, 100%, 80%, .6)',
      },
      output: [255, 153, 153, .6]
    }
  },
  to: {
    rgb: {
      input: {
        HEX3: '#0FF',
        HEX6: '#00FFFF',
        RGB: 'rgb(0, 255, 255)',
        HSL: 'hsl(180, 100%, 50%)',
      },
      output: [0, 255, 255, 1]
    },
    rgba: {
      input: {
        HEX3A: '#0FFC',
        HEX6A: '#00FFFFCC',
        RGBA: 'rgba(0, 255, 255, .8)',
        HSLA: 'hsla(180, 100%, 50%, .8)',
      },
      output: [0, 255, 255, .8]
    }
  },
}

function createColorTest(testName, inFrom, inTo, outFrom, outTo) {
  return test(testName, () => {
    const animation = anime({ targets: '#target-id', color: [inFrom, inTo] });
    expect(animation.tweens[0].from.type).toStrictEqual(valueTypes.COLOR);
    expect(animation.tweens[0].from.numbers).toStrictEqual(outFrom);
    expect(animation.tweens[0].to.type).toStrictEqual(valueTypes.COLOR);
    expect(animation.tweens[0].to.numbers).toStrictEqual(outTo);
    expect(animation.tweens[0].currentValue).toBe(`rgba(${outFrom[0]},${outFrom[1]},${outFrom[2]},${outFrom[3]})`);
    animation.seek(animation.duration);
    expect(animation.tweens[0].currentValue).toBe(`rgba(${outTo[0]},${outTo[1]},${outTo[2]},${outTo[3]})`);
  });
}

function createColorTestsByType(fromType, toType) {
  for (let inputFromName in colors.from[fromType].input) {
    const inputFromValue = colors.from[fromType].input[inputFromName];
    const outputFromValue = colors.from[fromType].output;
    for (let inputToName in colors.to[toType].input) {
      const inputToValue = colors.to[toType].input[inputToName];
      const outputToValue = colors.to[toType].output;
      const testName = 'Convert ' + inputFromName + ' to ' + inputToName;
      createColorTest(testName, inputFromValue, inputToValue, outputFromValue, outputToValue);
    }
  }
}

describe('Colors', () => {
  createColorTestsByType('rgb', 'rgb');
  createColorTestsByType('rgb', 'rgba');
  createColorTestsByType('rgba', 'rgb');
  createColorTestsByType('rgba', 'rgba');
});
