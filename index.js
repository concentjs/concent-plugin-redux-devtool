var { cst, ccContext, getState } = require('concent');
var { createStore, combineReducers } = require('redux');

var pluginName = 'reduxDevTool';
var toExport = module.exports = {};
var reduxStore = null;

function createReducer(module, initState) {
  return function (state, action) {
    if (state === undefined) state = initState;

    if (action.module === module) {
      return Object.assign(state, action.payload);
    } else {
      return state;
    }
  };
}

function createReducers() {
  const modules = Object.keys(ccContext.moduleName_stateKeys_);
  const reducers = {};
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

  reduxStore.subscribe(function(){
    if (actionLen === actionPrevLen + 1) {
      //来自于concent的监听
      actionPrevLen++;
    } else {
      // 来自于devtool点击jump 或者 skip
      console.warn('暂未打通concent与redux dev tool的jump、skip等功能');
    }
  });

}

var actionLen = 1;
var actionPrevLen = 1;
function dispatchAction(actionForRedux){
  if (reduxStore) {
    actionLen++;
    reduxStore.dispatch(actionForRedux);
  }
}

/** concent启动时会调用一次插件的install接口 */
toExport.install = function (on) {
  injectReduxDevTool();

  on(cst.SIG_STATE_CHANGED, function (data) {
    dispatchAction(data.payload)
  });

  on(cst.SIG_MODULE_CONFIGURED, function () {
    reduxStore.replaceReducer(combineReducers(createReducers()));
  });

  return { name: pluginName }
}


toExport.default = toExport;