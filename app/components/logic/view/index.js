import {Observable as O} from 'rx';

import {
  div, h2,
  select, option,
  label, input, button,
  br,
} from '@cycle/dom';

import openIcon from '../../../icons/open';
import exportIcon from '../../../icons/export';
import helpIcon from '../../../icons/help';

import './index.styl';

const render = (state, field, table) =>
  div('.app', [
    div('.app-head', [
      div('.action-panel', [
        div('.action-list', [
          div('.action-list-item', [
            button('.action-button', {
              attributes: {'data-panel': 'open'},
              title: 'Open Diagram...',
            }, openIcon(24)),
          ]),
          div('.action-list-item', [
            button('.action-button', {
              attributes: {'data-panel': 'save'},
              title: 'Export Diagram...',
            }, exportIcon(24)),
          ]),
          div('.action-list-item', [
            button('.action-button', {
              attributes: {'data-panel': 'help'},
              title: 'Help...',
            }, helpIcon(24)),
          ]),
        ]),
      ]),
      div('.field-panel', [field]),
    ]),
    div('.app-body', [
      state.fieldOutput.network &&
      state.fieldOutput.network.expressions.size ?
      div([
        div({style: {float: 'right'}}, [
          "Formatter:",
          select('.format-select', state.formatList.map((f) =>
            option({
              value: f.id,
            }, f.name)
          ).toArray()),
          br(),
          label([
            input({
              type: 'checkbox',
              name: 'subexpressions',
              checked: state.showSubExpressions,
            }),
            'Show sub expressions',
          ]),
        ]),
        h2('Table'),
        table,
      ]) : null,
    ]),
  ])
;

export default (state$, field$, table$, panels$) =>
  O.combineLatest(state$, field$, table$, panels$,
    (state, field, table, panels) =>
      div([
        panels,
        render(state, field, table),
      ])
  )
;
