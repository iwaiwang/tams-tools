import {Observable as O} from 'rx';

import {parseDataAttr} from '../../../lib/utils';

import panelActions from './panels';
import loopActions from './loops';
import functionActions from './function';

const isNoInput = (evt) => {
  const tagName = evt.target.tagName;
  return tagName !== 'INPUT' &&
    tagName !== 'TEXTAREA' &&
    tagName !== 'SELECT' &&
    tagName !== 'BUTTON';
};

export default ({DOM, keydown, openData$, viewSetting$}) => {
  const cancel$ = keydown
    .filter((evt) => evt.keyCode === 27);

  const loops = loopActions({DOM, cancel$});
  const functions = functionActions({DOM});
  const panels = panelActions({DOM});

  const outputItem = DOM
    .select('[data-kv-output]');

  const selectOutputEvent$ = outputItem
    .events('click')
    .filter((e) => e.target.tagName !== 'INPUT');

  const editModeButton = DOM
    .select('[data-edit-mode]');

  const kvModeButton = DOM
    .select('[data-kv-mode]');

  const switchKvModeEvent$ = kvModeButton
    .events('click');

  const switchEditModeEvent$ = editModeButton
    .events('click');

  return {
    selectOutput$:
      selectOutputEvent$
        .map(parseDataAttr('kvOutput'))
        .filter(isFinite)
        .share(),
    switchKvMode$:
      switchKvModeEvent$
        .map((evt) => evt.currentTarget.dataset.kvMode)
        .share(),
    switchEditMode$:
      switchEditModeEvent$
        .map((evt) => evt.currentTarget.dataset.editMode)
        .share(),
    openDiagram$: openData$,
    setViewSetting$: viewSetting$,

    panel$: panels.open$,

    removeLoop$: loops.removeLoop$,
    tryLoop$: loops.tryLoop$,
    stopTryLoop$: loops.stopTryLoop$,
    addLoop$: loops.addLoop$,

    addInput$: functions.addInput$,
    removeInput$: functions.removeInput$,
    cycleValue$: functions.cycleValue$,
    addOutput$: functions.addOutput$,
    removeOutput$: functions.removeOutput$,
    startRename$: functions.startRename$,
    cancelRename$: functions.cancelRename$,
    tryOutputName$: functions.tryOutputName$,
    confirmOutputName$: functions.confirmOutputName$,

    preventDefault: O.merge(
      panels.preventDefault,
      functions.preventDefault,
      loops.preventDefault,

      selectOutputEvent$,
      outputItem.events('mousedown').filter(isNoInput),
      switchKvModeEvent$,
      kvModeButton.events('mousedown'),
      switchEditModeEvent$,
      editModeButton.events('mousedown')
    ).share(),
  };
};
