describe('Stagger', () => {
  test('Increase each values by a specific value for each elements', () => {
    const animation = anime({
      targets: '.target-class',
      translateX: 100,
      duration: 10,
      delay: anime.stagger(10)
    });
    expect(animation.tweens[0].delay).toBe(0);
    expect(animation.tweens[1].delay).toBe(10);
    expect(animation.tweens[2].delay).toBe(20);
    expect(animation.tweens[3].delay).toBe(30);
  });

  test('Starts the staggering effect from a specific value', () => {
    const animation = anime({
      targets: '.target-class',
      translateX: 100,
      duration: 10,
      delay: anime.stagger(10, {start: 5})
    });
    expect(animation.tweens[0].delay).toBe(5);
    expect(animation.tweens[1].delay).toBe(15);
    expect(animation.tweens[2].delay).toBe(25);
    expect(animation.tweens[3].delay).toBe(35);
  });

  test('Distributes evenly values between two numbers', resolve => {
    const animation = anime({
      targets: '#stagger div',
      translateX: anime.stagger([-10, 10]),
      duration: 10,
      complete: () => {
        expect(animation.tweens[0].to.number).toBe(-10);
        expect(animation.tweens[1].to.number).toBe(-5);
        expect(animation.tweens[2].to.number).toBe(0);
        expect(animation.tweens[3].to.number).toBe(5);
        expect(animation.tweens[4].to.number).toBe(10);

        expect(animation.tweens[0].currentValue).toBe('-10px');
        expect(animation.tweens[1].currentValue).toBe('-5px');
        expect(animation.tweens[2].currentValue).toBe('0px');
        expect(animation.tweens[3].currentValue).toBe('5px');
        expect(animation.tweens[4].currentValue).toBe('10px');

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
        expect(animation.tweens[0].currentValue).toBe('-10rem');
        expect(animation.tweens[1].currentValue).toBe('-5rem');
        expect(animation.tweens[2].currentValue).toBe('0rem');
        expect(animation.tweens[3].currentValue).toBe('5rem');
        expect(animation.tweens[4].currentValue).toBe('10rem');

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
    expect(animation.tweens[0].delay).toBe(20);
    expect(animation.tweens[1].delay).toBe(10);
    expect(animation.tweens[2].delay).toBe(0);
    expect(animation.tweens[3].delay).toBe(10);
    expect(animation.tweens[4].delay).toBe(20);
  });

  test('Starts the stagger effect from the last element', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 'last'})
    });
    expect(animation.tweens[0].delay).toBe(40);
    expect(animation.tweens[1].delay).toBe(30);
    expect(animation.tweens[2].delay).toBe(20);
    expect(animation.tweens[3].delay).toBe(10);
    expect(animation.tweens[4].delay).toBe(0);
  });

  test('Starts the stagger effect from specific index', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 1})
    });
    expect(animation.tweens[0].delay).toBe(10);
    expect(animation.tweens[1].delay).toBe(0);
    expect(animation.tweens[2].delay).toBe(10);
    expect(animation.tweens[3].delay).toBe(20);
    expect(animation.tweens[4].delay).toBe(30);
  });

  test('Changes the order in which the stagger operates', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {from: 1, direction: 'reverse'})
    });
    expect(animation.tweens[0].delay).toBe(20);
    expect(animation.tweens[1].delay).toBe(30);
    expect(animation.tweens[2].delay).toBe(20);
    expect(animation.tweens[3].delay).toBe(10);
    expect(animation.tweens[4].delay).toBe(0);
  });

  test('Stagger values using an easing function', () => {
    const animation = anime({
      targets: '#stagger div',
      translateX: 10,
      delay: anime.stagger(10, {easing: 'easeInOutQuad'})
    });
    expect(animation.tweens[0].delay).toBe(0);
    expect(animation.tweens[1].delay).toBe(5);
    expect(animation.tweens[2].delay).toBe(20);
    expect(animation.tweens[3].delay).toBe(35);
    expect(animation.tweens[4].delay).toBe(40);
  });

  test('Grid staggering with a 2D array', () => {
    const animation = anime({
      targets: '#grid div',
      scale: [1, 0],
      delay: anime.stagger(10, {grid: [5, 3], from: 'center'})
    });

    expect(animation.tweens[0].delay).toBeCloseTo(22.4);
    expect(animation.tweens[1].delay).toBe(14.1);
    expect(animation.tweens[2].delay).toBe(10);
    expect(animation.tweens[3].delay).toBe(14.1);
    expect(animation.tweens[4].delay).toBeCloseTo(22.4);

    expect(animation.tweens[5].delay).toBe(20);
    expect(animation.tweens[6].delay).toBe(10);
    expect(animation.tweens[7].delay).toBe(0);
    expect(animation.tweens[8].delay).toBe(10);
    expect(animation.tweens[9].delay).toBe(20);

    expect(animation.tweens[10].delay).toBeCloseTo(22.4);
    expect(animation.tweens[11].delay).toBe(14.1);
    expect(animation.tweens[12].delay).toBe(10);
    expect(animation.tweens[13].delay).toBe(14.1);
    expect(animation.tweens[14].delay).toBeCloseTo(22.4);
  });

  test('Grid staggering with a 2D array', () => {
    const animation = anime({
      targets: '#grid div',
      translateX: anime.stagger(10, {grid: [5, 3], from: 'center', axis: 'x'}),
      translateY: anime.stagger(10, {grid: [5, 3], from: 'center', axis: 'y'})
    });

    expect(animation.tweens[0].to.number).toBe(-20);
    expect(animation.tweens[2].to.number).toBe(-10);
    expect(animation.tweens[4].to.number).toBe(0);
    expect(animation.tweens[6].to.number).toBe(10);
    expect(animation.tweens[8].to.number).toBe(20);

    expect(animation.tweens[10].to.number).toBe(-20);
    expect(animation.tweens[12].to.number).toBe(-10);
    expect(animation.tweens[14].to.number).toBe(0);
    expect(animation.tweens[16].to.number).toBe(10);
    expect(animation.tweens[18].to.number).toBe(20);

    expect(animation.tweens[20].to.number).toBe(-20);
    expect(animation.tweens[22].to.number).toBe(-10);
    expect(animation.tweens[24].to.number).toBe(0);
    expect(animation.tweens[26].to.number).toBe(10);
    expect(animation.tweens[28].to.number).toBe(20);

    expect(animation.tweens[1].to.number).toBe(-10);
    expect(animation.tweens[3].to.number).toBe(-10);
    expect(animation.tweens[5].to.number).toBe(-10);
    expect(animation.tweens[7].to.number).toBe(-10);
    expect(animation.tweens[9].to.number).toBe(-10);

    expect(animation.tweens[11].to.number).toBe(0);
    expect(animation.tweens[13].to.number).toBe(0);
    expect(animation.tweens[15].to.number).toBe(0);
    expect(animation.tweens[17].to.number).toBe(0);
    expect(animation.tweens[19].to.number).toBe(0);

    expect(animation.tweens[21].to.number).toBe(10);
    expect(animation.tweens[23].to.number).toBe(10);
    expect(animation.tweens[25].to.number).toBe(10);
    expect(animation.tweens[27].to.number).toBe(10);
    expect(animation.tweens[29].to.number).toBe(10);
  });
});
