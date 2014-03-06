
angular.module('sbTokenInput', ['sbMeasureText'])

  .directive('sbTokenInput', ['$timeout', 'sbMeasureTextWidth', function ($timeout, measureTextWidth) {

    return {
      restrict: 'EA',
      replace: true,
      scope: {
        tokens:'=sbTokens',
        input: '=sbInput',
        formatDisplay: '=sbFormatDisplay',
        displayProperty: '=sbDisplayProperty',
      },
      template: [
        '<div class="token-input" ng-click="onClick($event)">',
          '<span class="token-input-token" ng-repeat="token in tokens" tabindex="0" ng-keydown="onTokenKeydown($event, $index)">',
            '<span class="token-input-token-name" ng-bind="formatDisplay(token)"></span>',
            '<a class="token-input-token-remove" ng-click="removeToken(token)"></a>',
          '</span>',
          '<input class="token-input-input" type="text" ng-model="input" ng-style="inputStyle" ng-keydown="onInputKeydown($event)">',
        '</div>'
      ].join(''),

      link: function(scope, elem, attrs, model) {
        var input = elem.find('.token-input-input');

        if (!scope.tokens) scope.tokens = [];

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

        scope.removeToken = function (token) {
          var index = scope.tokens.indexOf(token);
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
  }]);
