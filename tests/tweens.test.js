import {
  valueTypes,
} from '../src/consts.js';

describe('Tweens', () => {
  test('Single tween timings', () => {
    const delay = 200;
    const duration = 300;
    const endDelay = 400;

    const animation = anime({
      targets: '#target-id',
      translateX: '100%',
      delay: delay,
      duration: duration,
      endDelay: endDelay
    });

    expect(animation.tweens[0].start).toBe(0);
    expect(animation.tweens[0].end).toBe(delay + duration + endDelay);
  });

  test('Keyframes tween timings', () => {
    const delay1 = 200;
    const duration1 = 300;
    const endDelay1 = 400;

    const delay2 = 300;
    const duration2 = 400;
    const endDelay2 = 500;

    const animation = anime({
      targets: '#target-id',
      translateX: [
        {value: '100%', delay: delay1, duration: duration1, endDelay: endDelay1},
        {value: '200%', delay: delay2, duration: duration2, endDelay: endDelay2}
      ],
    });

    expect(animation.tweens[0].start).toBe(0);
    expect(animation.tweens[0].end).toBe(delay1 + duration1 + endDelay1);

    expect(animation.tweens[1].start).toBe(delay1 + duration1 + endDelay1);
    expect(animation.tweens[1].end).toBe((delay1 + duration1 + endDelay1) + (delay2 + duration2 + endDelay2));
  });

  test('Simple tween easing', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: '100%',
      easing: 'linear'
    });

    expect(animation.tweens[0].easing(.5)).toBe(.5);
  });

  // Can't be tested in Jest...

  // test('Path tween', () => {
  //   const animation = anime({
  //     targets: '#path',
  //     translateX: '100%',
  //   });

  //   expect(animation.tweens[0].isPath).toBe(true);
  // });

  test('Color tween', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: '100%',
      backgroundColor: '#000',
    });

    expect(animation.tweens[1].type).toBe(valueTypes.COLOR);
    expect(animation.tweens[1].from.type).toBe(valueTypes.COLOR);
    expect(animation.tweens[1].to.type).toBe(valueTypes.COLOR);
  });

  test('Canceled tween should not update after the next sibling has been killed', () => {
    const targetEl = document.querySelector('#target-id');
    const tl = anime.timeline({
      targets: targetEl,
      easing: 'linear',
    })
    .add({
      width: 100,
      duration: 20
    })
    .add({
      width: -100,
      duration: 5,
      complete: () => {
        tl.children[1].tweens.forEach(tween => {
          if (tween.previous) {
            tween.previous.next = tween.next;
          }
          if (tween.next) {
            tween.next.previous = tween.previous;
          }
        })
        tl.children.splice(1, 1);
        tl._childrenLength = 1;
      }
    }, 10);

    tl.seek(5);
    expect(targetEl.style.width).toBe('25px');

    tl.seek(10);
    expect(targetEl.style.width).toBe('50px');

    tl.seek(15);
    expect(targetEl.style.width).toBe('-100px');

    tl.seek(20);
    expect(targetEl.style.width).toBe('-100px');

  });
});
