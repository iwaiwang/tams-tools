import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

const svgEventPosition = (() => {
  let oldPoint = null;
  return ({x,y}, evt) => {
    const svg = evt.target.ownerSVGElement || evt.target;
    const pt = oldPoint || (oldPoint = svg.createSVGPoint());
    pt.x = x;
    pt.y = y;
    const result = pt.matrixTransform(svg.getScreenCTM().inverse());
    return result;
  };
})();

const hammerEventPosition = (evt) =>
  svgEventPosition(evt.center, evt.srcEvent)
;

const hammerPanOptions = (manager, Hammer) => {
  const pan = new Hammer.Pan({
    threshold: 0,
    pointers: 1,
    direction: Hammer.DIRECTION_ALL,
  });
  manager.add(pan);

  const pinch = new Hammer.Pinch();
  pinch.recognizeWith(manager.get('pan'));
  manager.add(pinch);
};

export default (DOM) => {
  const rootElement = DOM.select('.graphics-root');

  const panStart$ = rootElement
    .events('panstart', hammerPanOptions);
  const panMove$ = rootElement
    .events('panmove');
  const panEnd$ = rootElement
    .events('panend pancancel');

  const pinchStart$ = rootElement
    .events('pinchstart');
  const pinchMove$ = rootElement
    .events('pinchmove');
  const pinchEnd$ = rootElement
    .events('pinchend pinchcancel');

  const wheel$ = rootElement
    .events('wheel')
    .do(preventDefault);

  const pan$ = O.merge(
    panStart$
    .map((evt) => svgEventPosition({
      x: evt.deltaX,
      y: evt.deltaY,
    }, evt.srcEvent))
    .flatMap((start) =>
      panMove$
      .map((evt) => svgEventPosition({
        x: evt.deltaX,
        y: evt.deltaY,
      }, evt.srcEvent))
      .map((target) => ({
        x: target.x - start.x,
        y: target.y - start.y,
      }))
      .takeUntil(panEnd$)
    ),
    pinchStart$
    .map(hammerEventPosition)
    .flatMap((start) =>
      pinchMove$
      .map(hammerEventPosition)
      .map((target) => ({
        x: target.x - start.x,
        y: target.y - start.y,
      }))
      .takeUntil(pinchEnd$)
    )
  );

  const zoom$ = O.merge(
    wheel$
    .map((evt) => {
      const pivot = svgEventPosition({
        x: evt.clientX,
        y: evt.clientY,
      },
      evt);
      const wheel = evt.deltaY / -40;
      const factor = Math.pow(
        1 + Math.abs(wheel) / 2,
        wheel > 0 ? 1 : -1
      );

      return {
        factor,
        pivot,
      };
    }),
    pinchStart$
    .flatMap((startEvt) =>
      pinchMove$
      .map((moveEvt) =>
      ({
        factor: moveEvt.scale,
        pivot: svgEventPosition(moveEvt.center, moveEvt.srcEvent),
      }))
      .startWith({
        factor: startEvt.scale,
        prevFactor: startEvt.scale,
        pivot: svgEventPosition(startEvt.center, startEvt.srcEvent),
      })
      .scan(
        ({prevFactor}, {factor, pivot}) => ({
          factor: factor / prevFactor,
          prevFactor: factor,
          pivot,
        })
      )
      .takeUntil(pinchEnd$)
    )
  );

  return {
    zoom$,
    pan$,
  };
};