/* jshint es3: true, browser: true */

angular.module('sbTokenInput', ['sbMeasureText'])

  .directive('sbTokenInput', ['$timeout', 'sbMeasureTextWidth', function ($timeout, measureTextWidth) {

    return {
      restrict: 'EA',
      replace: true,
      scope: {
        tokens:'=sbTokens',
        input: '=sbInput',
        placeholder: '@placeholder',
        formatDisplay: '&sbFormatDisplay',
        displayProperty: '@sbDisplayProperty',
        track: '&sbTrack',
        trackingProperty: '@sbTrackingProperty'
      },
      template: [
        '<div class="token-input dummy-input form-control" ng-click="onClick($event)">',
          '<div class="token-input-placeholder placeholder" ng-bind="placeholder" ng-show="placeholder && !input && !tokens.length"></div>',
          '<span class="token-input-token" ng-repeat="token in tokens track by track(token)" tabindex="0" ng-keydown="onTokenKeydown($event, $index)">',
            '<span class="token-input-token-name" ng-bind="formatDisplay(token)"></span>',
            '<a class="token-input-token-remove" ng-click="removeTokenAt(index)"></a>',
          '</span>',
          '<input class="token-input-input" type="text" ng-model="input" ng-style="inputStyle" ng-keydown="onInputKeydown($event)">',
        '</div>'
      ].join(''),

      link: function(scope, elem, attrs, model) {
        var input = elem.find('.token-input-input');

        scope.tokens = scope.tokens || [];
        scope.input = scope.input || '';
        scope.inputStyle = { width: '10px' };
        scope.formatDisplay = scope.formatDisplay();
        scope.track = scope.track();

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

        if (!scope.track) {
          if (scope.trackingProperty) {
            scope.track = function (item) {
              return item[scope.trackingProperty];
            };
          } else {
            scope.track = function (item) {
              return item;
            };
          }
        }

        scope.tracked = [];

        scope.$watch('tokens', function (val, prev) {
          scope.tracked = scope.tokens.map(scope.track);
        }, true);

        scope.hasToken = function (token) {
          return !!~scope.tracked.indexOf(scope.track(token));
        };

        scope.addToken = function (token) {
          if (scope.hasToken(token)) return;
          scope.tokens.push(token);
        };

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
        elem.on('click', function (event) {
          // We dont want to trigger a digest here
          var $elem = angular.element(event.target);
          if ($elem.hasClass('token-input') || $elem.hasClass('placeholder')) input.focus();
        });

        // Delete token If delete or backspace pressed while focussed
        scope.onTokenKeydown = function (event, index) {
          if (~[46,8].indexOf(event.which)) {
            event.preventDefault();
            scope.removeTokenAt(index);
          }
        };

        // If empty and delete or backspace pressed, select last token
        scope.onInputKeydown = function (event) {
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
      placeholder: '@placeholder',
      formatDisplay: '&sbFormatDisplay',
      displayProperty: '@sbDisplayProperty',
      track: '&sbTrack',
      trackingProperty: '@sbTrackingProperty'
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
          scope.addToken(token);
          scope.input = '';
        }
      });

      // Add token on return key press
      elem.find('input').on('keydown', function (event) {
        if (event.which == 13 && scope.input) {
          event.preventDefault();
          scope.$apply(function () {
            scope.addToken(scope.input);
            scope.input = '';
          });
        }
      });

      // Set view value
      scope.$watch('tokens', function (val, prev) {
        if (val === prev) return;
        ctrl.$setViewValue(val);
      }, true);

      // Update from model
      ctrl.$render = function () {
        scope.tokens = ctrl.$viewValue || [];
      };
    };

    // Delete compile function else the new link function wont be called
    delete def.compile;

    // Return the definition
    return def;
  }]);
