(function() {

  /*------------------------- Baseline setup ---------------------------------*/

  // Establish the root object, "window" in the browser, or "global" on the server.
  var root = this;
  var namespace = {};

  var l = root.l = _.extend(function(name) {
          return instance(name);
      }, {
      define: function (name) {
          var definition = new Definition(name);
          namespace[name] = definition;
          return definition;
      }
  });

  // Export the Underscore object for CommonJS.
  if (typeof exports !== 'undefined') exports.l = l;
  root.l = l;

  // Current version.
  l.VERSION = '0.0.1';


  /*------------------------- Classes ---------------------------------*/

  function Definition(name) {
      this._context = {};
      this._operators = {};
      this._symbols = {};
      this._terminates = {};
      this._start = null;
      this._rules = null;

      var lname = name;
      this.rules = function (def) {
          this._rules = function (ctx) {
              ctx.t = function (name) {
                  return function() {
                      var definition = namespace[lname];
                      var args = arguments;
                      return {
                          symbol: name,
                          param: arguments,
                          func: function (context) {
                              return definition._terminates[name].apply(context, args);
                          }
                      };
                  };
              };
              ctx.s = function (name) {
                  return function() {
                      var definition = namespace[lname];
                      var args = arguments;
                      return {
                          symbol: name,
                          param: args,
                          func: function (context) {
                              return definition._symbols[name].apply(context, args);
                          }
                      };
                  };
              };
              return def(ctx);
          };
          return this;
      };
  }
  Definition.prototype.context = function (def) {
      _.extend(this._context, def);
      return this;
  }
  Definition.prototype.operators = function (def) {
      _.extend(this._operators, def);
      return this;
  }
  Definition.prototype.symbols = function (def) {
      _.extend(this._symbols, def);
      return this;
  }
  Definition.prototype.terminates = function (def) {
      _.extend(this._terminates, def);
      return this;
  }
  Definition.prototype.start = function (def) {
      this._start = def;
      return this;
  }
  Definition.prototype.end = function () {
  }

  function Instance (def) {
      this.state = def._start;
      this.terminates = def._terminates;
      this.symbols = def._symbols;
      this.rules = def._rules;

      this.context = _.clone(def._context);
      this.operators = _.clone(def._operators);
  }
  Instance.prototype.next = function (lname) {
      var self = this;

      function mapSymbol(elems, ctx) {
          if (!elems)
              return symbols;
          if (elems.symbol)
              return elems.symbol;
          if (_.isString(elems)) {
              return elems;
          }
          var symbols = [];
         _.each(elems, function(elem, index) {
              if (_.isFunction(elem)) {
                  symbols.push(mapSymbol(elem(ctx), ctx));
              } else if (_.isArray(elem)) {
                  symbols.push(mapSymbol(elem, ctx));
              } else if (_.isString(elem)) {
                  symbols.push(elem);
              } else {
                  symbols.push(elem.symbol);
              }
          });
          return symbols;
      }

      function mapFunction(elems, ctx) {
          var funcs = [];
          if (!elems)
              return funcs;
          if (elems.func)
              return elems.func;
          _.each(elems, function(elem, index) {
              if (_.isFunction(elem)) {
                  funcs.push(mapFunction(elem(ctx), ctx));
              } else if (_.isArray(elem)) {
                  funcs.push(mapFunction(elem, ctx));
              } else {
                  funcs.push(elem.func);
              }
          });
          return funcs;
      }

      function rewrite(replacement, elem, rules, ctx) {

          function rewriteAny(obj) {
              if (_.isString(obj)) {
                  rewriteString(obj);
              }
              if (_.isArray(obj)) {
                  rewriteArray(obj);
              }
              if (_.isFunction(obj)) {
                  rewriteAny(obj(ctx));
              }
          }

          function rewriteString(str) {
              var rule = rules[str];
              if (rule) {
                  stringOrArray = rule(ctx);
                  if (_.isString(stringOrArray)) {
                      replacement.push({ symbol: stringOrArray });
                  } else {
                      _.each(stringOrArray, function (atom) {
                          if (_.isFunction(atom)) {
                              atom = atom(ctx);
                          }
                          replacement.push(atom);
                      });
                  }
              } else {
                  replacement.push({ symbol: str });
              }
          }

          function rewriteArray(array) {
              var holder = []
              _.each(array, function(elem) {
                  rewrite(holder, elem, rules, ctx);
              });
              replacement.push(holder);
          }

          rewriteAny(elem);
      }

      _.extend(this.context, this.operators)
      var ctx = this.context;
      var rules = this.rules(ctx);
      var replacement = [];
      _.each(this.state, function (elem) {
          rewrite(replacement, elem, rules, ctx);
      });
      this.state = mapSymbol(replacement);
      this.funcs = mapFunction(replacement);
  }
  Instance.prototype.applyAll = function (lname) {
      var stack = [];
      function applyAll(context, funcs) {
          _.each(funcs, function (func, index) {
              if (_.isArray(func)) {
                  stack.push(context);
                  context = _.clone(context);
                  applyAll(context, func);
                  context = stack.pop();
              } else if (_.isFunction(func)) {
                  func(context);
              }
          });
      }
      applyAll(this.context, this.funcs);
  }

  function instance (lname) {
      var counter = 0,
          inst = new Instance(namespace[lname]),
          cont = function (times) {
              while(counter < times) {
                  inst.next(lname);
                  counter++;
              }
              inst.applyAll(lname);
          };
      return cont;
  }

})();
