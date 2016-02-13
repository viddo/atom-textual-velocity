'use babel'

import { React, TestUtils } from 'react-for-atom'
import dispatchKeyDownEvent from '../../utils'
import EditComponent from '../../../lib/react/cells/edit-component'

describe('react/cells/edit-component', function () {
  let saveSpy, abortSpy
  let component, input

  beforeEach(function () {
    saveSpy = jasmine.createSpy('save')
    abortSpy = jasmine.createSpy('abort')
    component = TestUtils.renderIntoDocument(<EditComponent initialVal='foo' save={saveSpy} abort={abortSpy} />)
    input = component.refs.theInput
  })

  it('renders an input with the initial value', function () {
    expect(input.type).toEqual('text')
    expect(input.value).toEqual('foo')
  })

  describe('when <enter>', function () {
    beforeEach(function () {
      dispatchKeyDownEvent(input, { keyCode: 13 })
    })

    it('aborts since value has not changed', function () {
      expect(abortSpy).toHaveBeenCalled()
      expect(saveSpy).not.toHaveBeenCalled()
    })
  })

  describe('when input is changed', function () {
    beforeEach(function () {
      input.value = ' a b c '
      TestUtils.Simulate.change(input)
      dispatchKeyDownEvent(input, { keyCode: 40 }) // <down>
    })

    it('gets the changed value', function () {
      expect(input.value).toEqual(' a b c ')
    })

    it('does not call save or abort', function () {
      expect(saveSpy).not.toHaveBeenCalled()
      expect(abortSpy).not.toHaveBeenCalled()
    })

    describe('when <enter>', function () {
      beforeEach(function () {
        dispatchKeyDownEvent(input, { keyCode: 13 })
      })

      it('saves the changed value', function () {
        expect(saveSpy).toHaveBeenCalled()
        expect(saveSpy).toHaveBeenCalledWith('a b c')
        expect(abortSpy).not.toHaveBeenCalled()
      })
    })

    describe('when <esc>', function () {
      beforeEach(function () {
        dispatchKeyDownEvent(input, { keyCode: 27 })
      })

      it('aborts', function () {
        expect(abortSpy).toHaveBeenCalled()
        expect(saveSpy).not.toHaveBeenCalled()
      })
    })
  })
})
