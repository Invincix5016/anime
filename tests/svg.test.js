describe('SVG', () => {
  test('setDashoffset', () => {
    const dashOffsetAnimation = anime({
      targets: ['#line1', '#line2', '#circle', '#polygon', '#polyline', '#path', '#rect'],
      strokeDashoffset: [anime.setDashoffset, 0]
    });

    expect(dashOffsetAnimation.tweens[0].from.number).toBeCloseTo(138.59292602539062, -.5);
    expect(dashOffsetAnimation.tweens[1].from.number).toBeCloseTo(138.59292602539062, -.5);
    expect(dashOffsetAnimation.tweens[2].from.number).toBeCloseTo(313.6517028808594, -.5);
  });

  test('getPath', () => {
    const path = anime.path('#path');
    expect(path('x').totalLength).toBeDefined();
    expect(path('y').totalLength).toBeDefined();
    expect(path('angle').totalLength).toBeDefined();
  });

  // el.getTotalLength() and el.points are not defined in the test environment
  // test('Path animation', () => {
  //   const path = anime.path('#path');
  //   const animation = anime({
  //     targets: '#target-id',
  //     translateX: path('x'),
  //   });
  //   expect(animation.tweens[0].from.number).toBeCloseTo(399.06207275390625, -.5);
  // });
});
