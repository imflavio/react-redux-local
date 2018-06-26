import React, { Component, PureComponent, createContext } from 'react';
import { func, objectOf, arrayOf, object } from 'prop-types';
import { createStore, applyMiddleware, bindActionCreators } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import isFunction from 'lodash.isfunction';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

let LocalReducer = function (_Component) {
  inherits(LocalReducer, _Component);

  function LocalReducer(props) {
    classCallCheck(this, LocalReducer);

    var _this = possibleConstructorReturn(this, (LocalReducer.__proto__ || Object.getPrototypeOf(LocalReducer)).call(this, props));

    _this.dispatch = (action = {}) => _this.store.dispatch(action);

    const { reducer, saga, middleware, actions, devToolsOptions } = props;

    _this.sagaMiddleware = saga && createSagaMiddleware && createSagaMiddleware();

    const allMiddleware = [...middleware];

    if (_this.sagaMiddleware) allMiddleware.push(_this.sagaMiddleware);

    const enhancers = applyMiddleware(...allMiddleware);

    const composeEnhancers = composeWithDevTools(devToolsOptions);

    _this.state = reducer(undefined, {});

    _this.store = createStore(reducer, devToolsOptions ? composeEnhancers(enhancers) : enhancers);

    _this.store.subscribe(() => _this.setState(_this.store.getState()));
    if (_this.sagaMiddleware) _this.saga = _this.sagaMiddleware.run(saga);

    _this.boundActions = bindActionCreators(actions, _this.dispatch);
    return _this;
  }

  createClass(LocalReducer, [{
    key: 'componentWillUnMount',
    value: function componentWillUnMount() {
      if (this.sagaMiddleware) this.saga.cancel();
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children(this.state, this.boundActions, this.dispatch);
    }
  }]);
  return LocalReducer;
}(Component);

LocalReducer.propTypes = {
  reducer: func.isRequired,
  actions: objectOf(func.isRequired).isRequired,
  saga: func,
  middleware: arrayOf(func.isRequired),
  children: func.isRequired,
  devToolsOptions: object
};

LocalReducer.defaultProps = {
  middleware: []
};

let _class = function (_PureComponent) {
  inherits(_class, _PureComponent);

  function _class() {
    classCallCheck(this, _class);
    return possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
  }

  createClass(_class, [{
    key: 'render',
    value: function render() {
      const { children, state, actions, dispatch } = this.props;

      return children(state, actions, dispatch);
    }
  }]);
  return _class;
}(PureComponent);

var Context = (props => {
  if (!props.reducer) throw new Error('A reducer must be provided.');
  if (!props.actions) throw new Error('A set of actions must be provided.');
  const { Provider, Consumer } = createContext();

  const defaultMapState = () => undefined;
  const defaultMapActions = () => undefined;

  return {
    Provider: ({ children }) => React.createElement(
      LocalReducer,
      props,
      (state, actions, dispatch) => React.createElement(
        Provider,
        { value: { state, actions, dispatch } },
        children
      )
    ),

    Consumer: ({
      children,
      mapState = defaultMapState,
      mapActions = defaultMapActions
    }) => React.createElement(
      Consumer,
      null,
      ({ state, actions, dispatch }) => React.createElement(
        _class,
        {
          state: isFunction(mapState) ? mapState(state) : defaultMapState(state),
          actions: mapActions(actions, dispatch),
          dispatch: dispatch
        },
        children
      )
    )
  };
});

export default LocalReducer;
export { Context as createContext };
