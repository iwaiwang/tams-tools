import I from 'immutable';

export const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  pivotAngle: null,
}, 'graphNode');

export const graphEdge = I.Record({
  label: null,
  fromIndex: null,
  toIndex: null,
  path: null,
}, 'graphEdge');

export const _graph = I.Record({
  nodes: I.List(),
  edges: I.List(),
  bounds: null,
}, 'graph');

export const graphFromJson = (data) => {
  return _graph({
    nodes: I.List(data.nodes).map((n) => graphNode({
      label: n.label,
      x: n.x,
      y: n.y,
    })),
    edges: I.List(data.edges).map((e) => graphEdge({
      label: e.label,
      fromIndex: e.from,
      toIndex: e.to,
    })),
  });
};
