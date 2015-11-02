Repositories = require '../lib/repositories'
{Disposable} = require 'atom'

describe 'Repositories', ->
  beforeEach ->
    @repositories = new Repositories()
    @createRepositorySpy = (spyName) ->
      spy = jasmine.createSpyObj(spyName, ['query', 'onResults', 'dispose'])
      spy.onResults.andReturn(new Disposable())
      return spy

  afterEach ->
    @repositories.dispose()

  it 'allows repositories working before there are any results subscribers', ->
    repository = @createRepositorySpy('repository ex')
    @repositories.add(repository)
    expect(repository.onResults).toHaveBeenCalled()

  describe 'when there is at least one subscriber', ->
    beforeEach ->
      @resultsCountPropSpy = jasmine.createSpy('resultsCountProp')
      @resultsItemsPropSpy = jasmine.createSpy('resultsItemsProp')
      @repositories.resultsCountProp.onValue(@resultsCountPropSpy)
      @repositories.resultsItemsProp.onValue(@resultsItemsPropSpy)

    it 'creates results props', ->
      expect(@resultsCountPropSpy).toHaveBeenCalled()
      expect(@resultsItemsPropSpy).toHaveBeenCalled()
      expect(@resultsCountPropSpy.calls[0].args[0]).toEqual(0)
      expect(@resultsItemsPropSpy.calls[0].args[0]).toEqual([])

    describe 'when repositories are added', ->
      beforeEach ->
        @repository1 = @createRepositorySpy('repository1')
        @repository2 = @createRepositorySpy('repository2')
        @repositories.add(@repository1)
        @repositories.add(@repository2)

      it 'has results props', ->
        expect(@resultsCountPropSpy.calls[0].args[0]).toEqual(0)
        expect(@resultsItemsPropSpy.calls[0].args[0].length).toEqual(0)

      describe 'when repositories are queried', ->
        beforeEach ->
          @repositories.query({
            searchStr: 'abc',
            pageOffset: 12
            pageSize: 3
          })

        it 'queries the repositories', ->
          expect(@repository1.query).toHaveBeenCalled()
          expect(@repository2.query).toHaveBeenCalled()

          expect(@repository1.query.calls[0].args[0].searchStr).toEqual('abc')
          expect(@repository1.query.calls[0].args[0].pageOffset).toEqual(12)
          expect(@repository1.query.calls[0].args[0].pageSize).toEqual(3)

        describe 'when one repository has results', ->
          beforeEach ->
            @repository1.onResults.calls[0].args[0].call(this, {
              uuid: 'test-1',
              count: 42,
              items: [{
                title: '1st'
              }, {
                title: '2nd'
              }, {
                title: '3rd'
              }]
            })

          it 'updates results props', ->
            expect(@resultsCountPropSpy.calls[1].args[0]).toEqual(42)
            expect(@resultsItemsPropSpy.calls[1].args[0].length).toEqual(3)

        describe 'when multiple repositories has results', ->
          beforeEach ->
            @repositories.query({
              searchStr: '2nd'
              pageSize: 2
            })
            @repository1.onResults.calls[0].args[0].call(this, {
              uuid: 'test-1',
              count: 11,
              items: [{
                title: '1st'
              }, {
                title: '2nd'
              }]
            })
            @repository2.onResults.calls[0].args[0].call(this, {
              uuid: 'test-2',
              count: 22,
              items: [{
                title: '3rd'
              }, {
                title: '4th'
              }]
            })

          it 'updates the results props from the latest results', ->
            expect(@resultsCountPropSpy.calls[2].args[0]).toEqual(11 + 22)
            expect(@resultsItemsPropSpy.calls[2].args[0].length).toEqual(4)
