/* jshint es3: true, browser: true */

angular.module('sbTokenInput', ['sbMeasureText'])

  .directive('sbTokenInput', ['$timeout', 'sbMeasureTextWidth', function ($timeout, measureTextWidth) {

    return {
      restrict: 'EA',
      replace: true,
      scope: {
        tokens:'=sbTokens',
        input: '=sbInput',
        formatDisplay: '&sbFormatDisplay',
        displayProperty: '&sbDisplayProperty'
      },
      template: [
        '<div class="token-input" ng-click="onClick($event)">',
          '<span class="token-input-token" ng-repeat="token in tokens" tabindex="0" ng-keydown="onTokenKeydown($event, $index)">',
            '<span class="token-input-token-name" ng-bind="formatDisplay(token)"></span>',
            '<a class="token-input-token-remove" ng-click="removeTokenAt(index)"></a>',
          '</span>',
          '<input class="token-input-input" type="text" ng-model="input" ng-style="inputStyle" ng-keydown="onInputKeydown($event)">',
        '</div>'
      ].join(''),

      link: function(scope, elem, attrs, model) {
        var input = elem.find('.token-input-input');

        scope.formatDisplay = scope.formatDisplay();
        scope.displayProperty = scope.displayProperty();
        scope.tokens = scope.tokens || [];
        scope.inputStyle = { width: '10px' };

        if (!scope.formatDisplay) {
          if (scope.displayProperty) {
            scope.formatDisplay = function (item) {
              return item[scope.displayProperty];
            };
          } else {
            scope.formatDisplay = function (item) {
              return item;
            };
          }
        }

        scope.removeTokenAt = function (index) {
          // Remove token
          scope.tokens.splice(index, 1);
          // Set the focus to the next token back
          $timeout(function () {
            if (scope.tokens.length) {
              var nextTokenIndex = Math.min(index, scope.tokens.length-1);
              elem.find('.token-input-token').eq(nextTokenIndex).focus();
            } else {
              input.focus();
            }
          });
        };

        // Focus on input
        elem.on('click', function (e) {
          if (event.target === elem[0]) input.focus();
        });

        // Delete token If delete or backspace pressed while focussed
        scope.onTokenKeydown = function (event, index) {
          if (~[46,8].indexOf(event.which)) {
            event.preventDefault();
            scope.removeTokenAt(index);
          }
        };

        scope.onInputKeydown = function (event) {
          // If empty and delete or backspace pressed, select last token
          if (~[46,8].indexOf(event.which)) {
            if (!scope.input.length && scope.tokens.length) {
              elem.find('.token-input-token').eq(scope.tokens.length-1).focus();
            }
          }
        };

        scope.resizeInput = function () {
          if (!scope.input) {
            scope.inputStyle = { width: '10px' };
          } else {
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,
              //sideBorderPadding = getSideBorderPadding(this.search),
              sideBorderPadding = 5;

            minimumWidth = measureTextWidth(input) + 10;

            left = input.offset().left;

            maxWidth = elem.width();
            containerLeft = elem.offset().left;

            searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

            if (searchWidth < minimumWidth) {
              searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth < 40) {
              searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth <= 0) {
              searchWidth = minimumWidth;
            }

            scope.inputStyle = { width: searchWidth + 'px' };
          }
        };

        scope.$watch('input', scope.resizeInput);
      }
    };
  }])

  .directive('sbFreeTokenInput', ['sbTokenInputDirective', function (directive) {

    var def = {}, parent = directive[0];

    // Copy the parent directive definition
    angular.extend(def, parent);

    def.require = 'ngModel';

    def.scope = {
      formatDisplay: '&sbFormatDisplay',
      displayProperty: '&sbDisplayProperty'
    };

    // Override link function
    def.link = function (scope, elem, attrs, ctrl) {
      // Call parent link function
      parent.link.call(this, scope, elem, attrs);

      // Watch the input and add token when a comma is entered
      scope.$watch('input', function (text) {
        if (!text) return;
        if (text.charAt(text.length-1) === ',') {
          var token = text.substr(0, text.length-1);
          if (~scope.tokens.indexOf(token)) return;
          scope.tokens.push(token);
          scope.input = '';
        }
      });

      scope.$watch('tokens', function (val, prev) {
        console.log('watch', val, prev);
        ctrl.$setViewValue(val);
      }, true);

      ctrl.$render = function () {
        if (ctrl.$viewValue) {
          scope.tokens = ctrl.$viewValue;
        }
      };
    };

    // Delete compile function else the new link function wont be called
    delete def.compile;

    // Return the definition
    return def;
  }]);
