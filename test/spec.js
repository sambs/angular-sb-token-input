
describe('sbTokenInput module', function () {
  var $document, $timout, compile, scope, elem, sendKey;

  beforeEach(module('sbTokenInput'));

  beforeEach(inject(function (_$document_, _$timeout_) {
    $document = _$document_;
    $timeout = _$timeout_;
  }));

  beforeEach(inject(function($rootScope, $compile) {
    compile = function (options) {
      elem = angular.element(options.template);
      scope = $rootScope;
      for (var key in options.scope) { scope[key] = options.scope[key]; }
      $compile(elem)(scope);
      scope.$digest();
      elem.appendTo(document.body);
    };

    sendKey = function (elem, key) {
      var code = {
        'return': 13
      }[key];
      if (!code) throw new Error('Unknown key: '+key);
      elem.trigger($.Event('keydown', { which: code }));
    };
  }));

  describe('sbTokenInput directive', function () {

    describe('with strings', function () {
      var iscope;

      beforeEach(function () {
        compile({
          template: '<div sb-token-input sb-tokens="tags" sb-input="query"></div>',
          scope: {}
        });
        iscope = elem.isolateScope();
      });

      it('should init', function () {
        expect(iscope.tokens).toEqual([]);
        expect(iscope.input).toEqual('');
        expect(iscope.formatDisplay('thing')).toEqual('thing');
        expect(iscope.hasToken('thing')).toEqual(false);
        expect(elem.find('.placeholder')).toHaveClass('ng-hide');
      });

      it('should add tokens', function () {
        iscope.addToken('thing');
        scope.$digest();
        expect(iscope.tokens).toEqual(['thing']);
        expect(iscope.hasToken('thing')).toEqual(true);
      });

      it('shouldnt add same token again', function () {
        iscope.tags = ['thing'];
        scope.$digest();
        iscope.addToken('thing');
        expect(iscope.tokens).toEqual(['thing']);
      });

      it('should remove tokens', function () {
        iscope.tags = ['thing'];
        scope.$digest();
        iscope.removeTokenAt(0);
        expect(iscope.tokens).toEqual([]);
        expect(iscope.hasToken('thing')).toEqual(false);
      });
    });

    describe('with objects', function () {
      var iscope;

      beforeEach(function () {
        compile({
          template: '<div sb-token-input sb-tokens="tags" sb-input="query" sb-display-property="name" sb-tracking-property="id"></div>',
          scope: {}
        });
        iscope = elem.isolateScope();
      });

      it('should init', function () {
        expect(iscope.tokens).toEqual([]);
        expect(iscope.input).toEqual('');
        expect(iscope.formatDisplay({ id: 1, name: 'peachy' })).toEqual('peachy');
        expect(iscope.hasToken('thing')).toEqual(false);
      });

      it('should add tokens', function () {
        iscope.addToken({ id: 1, name: 'peachy' });
        scope.$digest();
        expect(iscope.tokens).toEqual([{ id: 1, name: 'peachy' }]);
        expect(iscope.hasToken({ id: 1, name: 'peachy' })).toEqual(true);
      });

      it('shouldnt add same token again', function () {
        iscope.tags = [{ id: 1, name: 'peachy' }];
        scope.$digest();
        iscope.addToken({ id: 1, name: 'peachy' });
        expect(iscope.tokens).toEqual([{ id: 1, name: 'peachy' }]);
      });

      it('should remove tokens', function () {
        iscope.tags = [{ id: 1, name: 'peachy' }];
        scope.$digest();
        iscope.removeTokenAt(0);
        expect(iscope.tokens).toEqual([]);
        expect(iscope.hasToken({ id: 1, name: 'peachy' })).toEqual(false);
      });
    });

    describe('with placeholder', function () {
      var iscope;

      beforeEach(function () {
        compile({
          template: '<div sb-token-input sb-tokens="tags" sb-input="query" placeholder="Search..."></div>',
          scope: {}
        });
        iscope = elem.isolateScope();
      });

      it('should show', function () {
        expect(elem.find('.placeholder')).not.toHaveClass('ng-hide');
        elem.find('input').val('asdf').trigger('change');
        scope.$digest();
        expect(elem.find('.placeholder')).toHaveClass('ng-hide');
      });

      it('should hide when query', function () {
        iscope.input = 'aslkdfj';
        scope.$digest();
        expect(elem.find('.placeholder')).toHaveClass('ng-hide');
      });

      it('should hide when tokens', function () {
        iscope.tokens = ['bread'];
        scope.$digest();
        expect(elem.find('.placeholder')).toHaveClass('ng-hide');
      });
    });

    describe('with sbFormatDisplay attr', function () {
      var iscope;

      beforeEach(function () {
        compile({
          template: '<div sb-token-input sb-tokens="tags" sb-input="query" sb-format-display="toDisplay"></div>',
          scope: {
            tags: ['bird'],
            toDisplay: function (token) {
              return 'big '+token;
            }
          }
        });
        iscope = elem.isolateScope();
      });

      it('should work', function () {
        expect(elem.find('.token-input-token').first().text()).toEqual('big bird'); 
        scope.tags.push('bum');
        scope.$digest();
        expect(elem.find('.token-input-token').eq(1).text()).toEqual('big bum'); 
      });
    });
  });

  describe('sbFreeTokenInput directive', function () {

    describe('with strings', function () {
      var iscope;

      beforeEach(function () {
        compile({
          template: '<form name="form"><div sb-free-token-input name="tags" ng-model="obj.tags"></div></form>',
          scope: { obj: { tags: ['bread'] }}
        });
        iscope = elem.find('.token-input').isolateScope();
      });

      it('should init', function () {
        expect(iscope.tokens).toEqual(['bread']);
      });

      it('should add token after comma input', function () {
        iscope.input = 'butter,';
        scope.$digest();
        expect(scope.obj.tags).toEqual(['bread', 'butter']);
      });

      it('should add token on return key press', function () {
        iscope.input = 'butter';
        sendKey(elem.find('input'), 'return');
        scope.$digest();
        expect(scope.obj.tags).toEqual(['bread', 'butter']);
      });
    });
  });
});
