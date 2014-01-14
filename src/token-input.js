angular.module('tokenInput', ['measureText', 'ui.keypress'])
  
  .directive('tokenInputType', ['$timeout', 'measureTextWidth', function ($timeout, measureTextWidth) {

    return {
      restrict: 'A',
      replace: true,
      scope: { tokens:'=tokens', inputText: '=inputText', formatToken: '=formatToken' },
      template: [
        '<div class="token-input dummy-input">',
          '<span class="token-input-token btn" ng-repeat="token in tokens" tabindex="0" ui-keydown="{\'delete backspace\': \'removeTokenAtIndex($index, $event)\'}">',
            '<span class="token-input-token-name" ng-bind="formatToken(token)"></span>',
            '<a class="token-input-token-remove" ng-click="removeTokenAtIndex($index)"></a>',
          '</span>',
          '<input class="token-input-input" type="text" ng-model="inputText" ng-style="inputStyle" ui-keydown="{\'backspace\': \'onInputDelete()\', \'return enter\': \'onInputEnter()\' }" ng-focus="onFocus()">',
        '</div>'
      ].join(''),  

      link: function($scope, $element, attrs, model) {
        var $input = $element.find('.token-input-input');

        if (!$scope.tokens) $scope.tokens = [];
        if (!$scope.inputText) $scope.inputText = '';

        $scope.inputStyle = { width: '10px' };

        if (!$scope.formatToken) {
          $scope.formatToken = function (token) {
            return token;
          };
        }

        $scope.removeTokenAtIndex = function (index, $event) {
          $scope.tokens.splice(index, 1);

          if ($event) $event.preventDefault();

          $timeout(function () {
            // Set the focus to the next token back
            if ($scope.tokens.length) {
              var nextTokenIndex = Math.min(index, $scope.tokens.length-1);
              $element.find('.token-input-token').eq(nextTokenIndex).focus();
            } else {
              $input.focus();
            }
          });
        };

        $element.on('click', function (e) {
          // Focus on input unless a specific tag was clicked;
          if ($(e.target).is('[class^=token-input-token]')) return;
          e.preventDefault();
          $input.focus();
        });

        $scope.$watch('inputText', function () {
          resizeInput();
        });

        $scope.onInputDelete = function () {
          if (!$scope.inputText.length && $scope.tokens.length) {
            $element.find('.token-input-token').eq($scope.tokens.length-1).focus();
          }
        };
        
        $scope.onInputEnter = function () {
          $scope.$emit('tokenInputEnter');
        };
        
        $scope.onFocus = function () {
          $scope.$emit('tokenInputFocus');
        };
        
        function resizeInput () {
          if (!$scope.inputText) {
            $scope.inputStyle = { width: '10px' };
          } else {
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,
              //sideBorderPadding = getSideBorderPadding(this.search),
              sideBorderPadding = 5;

            minimumWidth = measureTextWidth($input) + 10;

            left = $input.offset().left;

            maxWidth = $element.width();
            containerLeft = $element.offset().left;

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

            $scope.inputStyle = { width: searchWidth + 'px' };
          }
        }
      }
    };
  }]);

