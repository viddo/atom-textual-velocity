NewUserRepository = require '../new-user-repository/new-user-repository'

describe 'NewUserRepository', ->
  beforeEach ->
    doneCallback = jasmine.createSpy('onResults')
    @repository = new NewUserRepository(doneCallback)
    @resultsSpy = jasmine.createSpy('onResults')
    @repository.onResults(@resultsSpy)
    waitsFor ->
      doneCallback.calls.length is 1

  afterEach ->
    @repository.dispose()

  describe 'when repository is given a default query', ->
    beforeEach ->
      @repository.query({
        searchStr: ''
        pageOffset: 0
        pageSize: 77
      })

    describe 'when results are returned', ->
      beforeEach ->
        waitsFor ->
          @resultsSpy.calls.length is 1

      it 'returns an expected result set', ->
        results = @resultsSpy.calls[0].args[0]
        expect(results.uuid).toMatch(/[\w-]+/)
        expect(results.count).toEqual(6)
        expect(results.items.length).toEqual(6)
        expect(results.items[0].title).toMatch(/\w+/)

  describe 'when repository is given a custom query', ->
    beforeEach ->
      @repository.query({
        searchStr: 'welcome'
        pageOffset: 0
        pageSize: 77
      })

    describe 'when results are returned', ->
      beforeEach ->
        waitsFor ->
          @resultsSpy.calls.length is 1

      it 'returns an expected result set', ->
        results = @resultsSpy.calls[0].args[0]
        expect(results.uuid).toMatch(/[\w-]+/)
        expect(results.count).toEqual(1)
        expect(results.items.length).toEqual(1)
        expect(results.items[0].title).toMatch(/\w+/)
