/* eslint-disable complexity */

import {
  tr, th, span,
} from '@cycle/dom';

import {labelCell} from './labelCell';

export default (colCount, {top, left, right, bottom}, inputsEditable) =>
  top !== null && [
    tr('.kv-table-row-edit.kv-row-top', {
      key: 'head-row-edit',
    },[
      left !== null &&
      th('.kv-table-corner-edit', {colSpan: 2}) || null,

      top !== null &&
      th('.kv-table-cell-edit.kv-cell-neg') || null,

      top !== null &&
      th('.kv-table-cell-edit.kv-cell-pos',
        {colSpan: colCount / 2},
        labelCell(top, inputsEditable)
      ) || null,

      bottom !== null &&
      th('.kv-table-cell-edit.kv-cell-neg') || null,

      right !== null && th('.kv-table-corner-edit', {colSpan: 2}) || null,
    ]),
    tr('.kv-table-row-title.kv-row-top', {
      key: 'head-row',
    }, [
      left !== null &&
      th('.kv-table-corner', {colSpan: 2}) || null,

      top !== null &&
      th('.kv-table-cell-title.kv-cell-neg', [
        span(`~${top.name}`),
      ]) || null,

      top !== null &&
      th('.kv-table-cell-title.kv-cell-pos',
        {colSpan: colCount / 2},
        span(`${top.name}`)
      ) || null,

      bottom !== null &&
      th('.kv-table-cell-title.kv-cell-neg', [
        span(`~${top.name}`),
      ]) || null,

      right !== null && th('.kv-table-corner', {colSpan: 2}) || null,
    ]) || null,
  ]
;
