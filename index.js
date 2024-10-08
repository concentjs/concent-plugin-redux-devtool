var { cst, ccContext, getState } = require('concent');
var { createStore, combineReducers } = require('redux');

var { FORCE_UPDATE, SET_STATE, SET_MODULE_STATE, INVOKE, SYNC } = cst;

var pluginName = 'reduxDevTool';
var toExport = module.exports = {};
var reduxStore = null;

function createReducer(module, initState) {
  return function (state, action) {
    if (state === undefined) state = initState;

    if (action.module === module) {
      var targetPayload = action.sharedState || action.payload;
      return Object.assign(state, targetPayload);
    } else {
      return state;
    }
  };
}

function createReducers() {
  var modules = Object.keys(ccContext.moduleName2stateKeys);
  var reducers = {};
  modules.forEach(function (m) {
    reducers[m] = createReducer(m, getState(m));
  });
  return reducers;
}

function injectReduxDevTool() {
  reduxStore = createStore(
    combineReducers(createReducers()),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  reduxStore.subscribe(function () {
    if (actionLen === actionPrevLen + 1) {
      //来自于concent的监听
      actionPrevLen++;
    } else {
      // 来自于devtool点击jump 或者 skip
      if (toolConf.log) console.warn('暂未打通concent与redux dev tool的jump、skip等功能');
    }
  });

}

var actionLen = 1;
var actionPrevLen = 1;
function dispatchAction(actionForRedux) {
  if (reduxStore) {
    actionLen++;
    reduxStore.dispatch(actionForRedux);
  }
}

function getActionType(calledBy, type) {
  if ([FORCE_UPDATE, SET_STATE, SET_MODULE_STATE, INVOKE, SYNC].includes(calledBy)) {
    return `ccApi/${calledBy}`;
  } else {
    return `dispatch/${type}`;
  }
}

function getPayload(payload) {
  const newPayload = Object.assign({}, payload);
  newPayload.type = getActionType(payload.calledBy, payload.type);
  return newPayload;
}

/** concent启动时会调用一次插件的install接口 */
toExport.install = function (on) {
  injectReduxDevTool();

  on(cst.SIG_STATE_CHANGED, function (data) {
    dispatchAction(getPayload(data.payload));
  });

  on(cst.SIG_MODULE_CONFIGURED, function () {
    reduxStore.replaceReducer(combineReducers(createReducers()));
  });

  return { name: pluginName }
}

var toolConf = { log: true };
toExport.setConf = function (conf) {
  var _conf = conf || {};
  if (_conf.log !== undefined) toolConf.log = _conf.log;
}


toExport.default = toExport;