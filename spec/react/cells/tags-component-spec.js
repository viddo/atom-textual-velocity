'use babel'

import { React, TestUtils } from 'react-for-atom'
import TagsComponent from '../../../lib/react/cells/tags-component'

describe('react/cells/summary-title', function () {
  let renderer, r

  beforeEach(function () {
    renderer = TestUtils.createRenderer()
  })

  it('renders name of normal file', function () {
    renderer.render(<TagsComponent tags='a b c' />)
    r = renderer.getRenderOutput()
    expect(r.props.children[0]).toEqual(<span key='a' className='inline-block highlight'>a</span>)
    expect(r.props.children[1]).toEqual(<span key='b' className='inline-block highlight'>b</span>)
    expect(r.props.children[2]).toEqual(<span key='c' className='inline-block highlight'>c</span>)
  })
})
