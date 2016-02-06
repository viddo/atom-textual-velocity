'use babel'

import { React, TestUtils } from 'react-for-atom'
import SummaryTitle from '../../../lib/react/cells/summary-title-component'

describe('react/cells/summary-title', function () {
  let renderer, r

  beforeEach(function () {
    renderer = TestUtils.createRenderer()
  })

  describe('when there is no regexp', function () {
    it('renders name of normal file', function () {
      renderer.render(<SummaryTitle name='filename' ext='.txt' regexp={null} />)
      r = renderer.getRenderOutput()
      expect(r.props.children[0]).toEqual('filename')
      expect(r.props.children[1]).toEqual(<span className='text-subtle'>.txt</span>)
    })

    it('renders only filename when there is no file ext', function () {
      renderer.render(<SummaryTitle name='filename' regexp={null} />)
      r = renderer.getRenderOutput()
      expect(r.props.children[0]).toEqual('filename')
      expect(r.props.children[1].props.children).toEqual('')
    })
  })

  describe('when there is a regexp', function () {
    it('highlights the matching part of the name', function () {
      renderer.render(<SummaryTitle name='filename' ext='.md' regexp={/enam/} />)
      r = renderer.getRenderOutput()
      expect(r.props.children[0]).toEqual('fil')
      expect(r.props.children[1]).toEqual(<span className='text-highlight'>enam</span>)
      expect(r.props.children[2]).toEqual('e')
      expect(r.props.children[3]).toEqual(<span className='text-subtle'>.md</span>)
    })
  })
})
