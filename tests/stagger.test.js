describe('Stagger', () => {
  test('Increase each values by a specific value for each elements', () => {
    const animation = anime({
      targets: '.target-class',
      translateX: 100,
      duration: 10,
      delay: anime.stagger(10)
    });
    expect(animation.animations[0].delay).toBe(0);
    expect(animation.animations[1].delay).toBe(10);
    expect(animation.animations[2].delay).toBe(20);
    expect(animation.animations[3].delay).toBe(30);
  });

  test('Starts the staggering effect from a specific value', () => {
    const animation = anime({
      targets: '.target-class',
      translateX: 100,
      duration: 10,
      delay: anime.stagger(10, {start: 5})
    });
    expect(animation.animations[0].delay).toBe(5);
    expect(animation.animations[1].delay).toBe(15);
    expect(animation.animations[2].delay).toBe(25);
    expect(animation.animations[3].delay).toBe(35);
  });

  test('Distributes evenly values between two numbers', resolve => {
    const animation = anime({
      targets: '#stagger div',
      translateX: anime.stagger([-10, 10]),
      duration: 10,
      complete: () => {
        expect(animation.animations[0].tweens[0].to.number).toBe(-10);
        expect(animation.animations[1].tweens[0].to.number).toBe(-5);
        expect(animation.animations[2].tweens[0].to.number).toBe(0);
        expect(animation.animations[3].tweens[0].to.number).toBe(5);
        expect(animation.animations[4].tweens[0].to.number).toBe(10);

        expect(animation.animations[0].tweens[0].currentValue).toBe('-10px');
        expect(animation.animations[1].tweens[0].currentValue).toBe('-5px');
        expect(animation.animations[2].tweens[0].currentValue).toBe('0px');
        expect(animation.animations[3].tweens[0].currentValue).toBe('5px');
        expect(animation.animations[4].tweens[0].currentValue).toBe('10px');

        resolve();
      }
    });
  });

  test('Specific staggered ranged value unit', resolve => {
    const animation = anime({
      targets: '#stagger div',
      translateX: anime.stagger(['-10rem', '10rem']),
      duration: 10,
      complete: () => {
        expect(animation.animations[0].tweens[0].currentValue).toBe('-10rem');
        expect(animation.animations[1].tweens[0].currentValue).toBe('-5rem');
        expect(animation.animations[2].tweens[0].currentValue).toBe('0rem');
        expect(animation.animations[3].tweens[0].currentValue).toBe('5rem');
        expect(animation.animations[4].tweens[0].currentValue).toBe('10rem');

        resolve();
      }
    });
  });

  test('Starts the stagger effect from the center', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 'center'})
    });
    expect(animation.animations[0].delay).toBe(20);
    expect(animation.animations[1].delay).toBe(10);
    expect(animation.animations[2].delay).toBe(0);
    expect(animation.animations[3].delay).toBe(10);
    expect(animation.animations[4].delay).toBe(20);
  });

  test('Starts the stagger effect from the last element', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 'last'})
    });
    expect(animation.animations[0].delay).toBe(40);
    expect(animation.animations[1].delay).toBe(30);
    expect(animation.animations[2].delay).toBe(20);
    expect(animation.animations[3].delay).toBe(10);
    expect(animation.animations[4].delay).toBe(0);
  });

  test('Starts the stagger effect from specific index', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 1})
    });
    expect(animation.animations[0].delay).toBe(10);
    expect(animation.animations[1].delay).toBe(0);
    expect(animation.animations[2].delay).toBe(10);
    expect(animation.animations[3].delay).toBe(20);
    expect(animation.animations[4].delay).toBe(30);
  });

  test('Changes the order in which the stagger operates', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 1, direction: 'reverse'})
    });
    expect(animation.animations[0].delay).toBe(20);
    expect(animation.animations[1].delay).toBe(30);
    expect(animation.animations[2].delay).toBe(20);
    expect(animation.animations[3].delay).toBe(10);
    expect(animation.animations[4].delay).toBe(0);
  });

  test('Stagger values using an easing function', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {easing: 'easeInOutQuad'})
    });
    expect(animation.animations[0].delay).toBe(0);
    expect(animation.animations[1].delay).toBe(5);
    expect(animation.animations[2].delay).toBe(20);
    expect(animation.animations[3].delay).toBe(35);
    expect(animation.animations[4].delay).toBe(40);
  });

  test('Grid staggering with a 2D array', () => {
    const animation = anime({
      targets: '#grid div',
      scale: [1, 0],
      delay: anime.stagger(10, {grid: [5, 3], from: 'center'})
    });

    expect(animation.animations[0].delay).toBeCloseTo(22.4);
    expect(animation.animations[1].delay).toBe(14.1);
    expect(animation.animations[2].delay).toBe(10);
    expect(animation.animations[3].delay).toBe(14.1);
    expect(animation.animations[4].delay).toBeCloseTo(22.4);

    expect(animation.animations[5].delay).toBe(20);
    expect(animation.animations[6].delay).toBe(10);
    expect(animation.animations[7].delay).toBe(0);
    expect(animation.animations[8].delay).toBe(10);
    expect(animation.animations[9].delay).toBe(20);

    expect(animation.animations[10].delay).toBeCloseTo(22.4);
    expect(animation.animations[11].delay).toBe(14.1);
    expect(animation.animations[12].delay).toBe(10);
    expect(animation.animations[13].delay).toBe(14.1);
    expect(animation.animations[14].delay).toBeCloseTo(22.4);
  });

  test('Grid staggering with a 2D array', () => {
    const animation = anime({
      targets: '#grid div',
      translateX: anime.stagger(10, {grid: [5, 3], from: 'center', axis: 'x'}),
      translateY: anime.stagger(10, {grid: [5, 3], from: 'center', axis: 'y'})
    });

    expect(animation.animations[0].tweens[0].to.number).toBe(-20);
    expect(animation.animations[2].tweens[0].to.number).toBe(-10);
    expect(animation.animations[4].tweens[0].to.number).toBe(0);
    expect(animation.animations[6].tweens[0].to.number).toBe(10);
    expect(animation.animations[8].tweens[0].to.number).toBe(20);

    expect(animation.animations[10].tweens[0].to.number).toBe(-20);
    expect(animation.animations[12].tweens[0].to.number).toBe(-10);
    expect(animation.animations[14].tweens[0].to.number).toBe(0);
    expect(animation.animations[16].tweens[0].to.number).toBe(10);
    expect(animation.animations[18].tweens[0].to.number).toBe(20);

    expect(animation.animations[20].tweens[0].to.number).toBe(-20);
    expect(animation.animations[22].tweens[0].to.number).toBe(-10);
    expect(animation.animations[24].tweens[0].to.number).toBe(0);
    expect(animation.animations[26].tweens[0].to.number).toBe(10);
    expect(animation.animations[28].tweens[0].to.number).toBe(20);

    expect(animation.animations[1].tweens[0].to.number).toBe(-10);
    expect(animation.animations[3].tweens[0].to.number).toBe(-10);
    expect(animation.animations[5].tweens[0].to.number).toBe(-10);
    expect(animation.animations[7].tweens[0].to.number).toBe(-10);
    expect(animation.animations[9].tweens[0].to.number).toBe(-10);

    expect(animation.animations[11].tweens[0].to.number).toBe(0);
    expect(animation.animations[13].tweens[0].to.number).toBe(0);
    expect(animation.animations[15].tweens[0].to.number).toBe(0);
    expect(animation.animations[17].tweens[0].to.number).toBe(0);
    expect(animation.animations[19].tweens[0].to.number).toBe(0);

    expect(animation.animations[21].tweens[0].to.number).toBe(10);
    expect(animation.animations[23].tweens[0].to.number).toBe(10);
    expect(animation.animations[25].tweens[0].to.number).toBe(10);
    expect(animation.animations[27].tweens[0].to.number).toBe(10);
    expect(animation.animations[29].tweens[0].to.number).toBe(10);
  });
});
