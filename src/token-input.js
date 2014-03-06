
angular.module('tokenInput', ['sbMeasureText'])

  .directive('tokenInputType', ['$timeout', 'sbMeasureTextWidth', function ($timeout, measureTextWidth) {

    return {
      restrict: 'A',
      replace: true,
      scope: { tokens:'=tokens', inputText: '=inputText', formatToken: '=formatToken' },
      template: [
        '<div class="token-input">',
          '<span class="token-input-token" ng-repeat="token in tokens" tabindex="0" ng-keydown="onTokenKeydown($event, $index)">',
            '<span class="token-input-token-name" ng-bind="formatToken(token)"></span>',
            '<a class="token-input-token-remove" ng-click="removeTokenAt($index)"></a>',
          '</span>',
          '<input class="token-input-input" type="text" ng-model="inputText" ng-style="inputStyle" ng-keydown="onInputKeydown($event)" ng-focus="onFocus()">',
        '</div>'
      ].join(''),

      link: function(scope, elem, attrs, model) {
        var input = elem.find('.token-input-input');

        if (!scope.tokens) scope.tokens = [];
        if (!scope.inputText) scope.inputText = '';

        scope.inputStyle = { width: '10px' };

        if (!scope.formatToken) {
          scope.formatToken = function (token) {
            return token;
          };
        }

        scope.removeTokenAt = function (index) {
          scope.tokens.splice(index, 1);

          $timeout(function () {
            // Set the focus to the next token back
            if (scope.tokens.length) {
              var nextTokenIndex = Math.min(index, scope.tokens.length-1);
              elem.find('.token-input-token').eq(nextTokenIndex).focus();
            } else {
              input.focus();
            }
          });
        };

        elem.on('click', function (e) {
          // Focus on input unless a specific tag was clicked;
          if ($(e.target).is('[class^=token-input-token]')) return;
          e.preventDefault();
          input.focus();
        });

        scope.$watch('inputText', function () {
          resizeInput();
        });

        scope.onFocus = function () {
          scope.$emit('tokenInputFocus');
        };

        scope.onTokenKeydown = function (event, index) {
          // If delete or backspace
          if (~[46,8].indexOf(event.which)) { 
            event.preventDefault();
            scope.removeTokenAt(index);
          }
        };

        scope.onInputKeydown = function (event) {
          // If delete or backspace select last token
          if (~[46,8].indexOf(event.which)) {
            if (!scope.inputText.length && scope.tokens.length) {
              elem.find('.token-input-token').eq(scope.tokens.length-1).focus();
            }
          }
        };

        function resizeInput () {
          if (!scope.inputText) {
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
        }
      }
    };
  }]);

