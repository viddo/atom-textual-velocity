'use babel'

import { React, TestUtils } from 'react-for-atom'
import TagsComponent from '../../../lib/react/cells/tags-component'

describe('react/cells/tags-component', function () {
  let renderer, r, file, evSpy

  beforeEach(function () {
    evSpy = jasmine.createSpyObj('event', ['stopPropagation'])
    renderer = TestUtils.createRenderer()
    file = {
      tags: 'a b c'
    }
  })

  it('renders tags as indidvidual items', function () {
    renderer.render(<TagsComponent file={file} isSelected={false} />)
    r = renderer.getRenderOutput()
    expect(r.props.children.length).toBe(3)
    expect(r.props.children[0]).toEqual(<span key='a' className='inline-block highlight'>a</span>)
    expect(r.props.children[1]).toEqual(<span key='b' className='inline-block highlight'>b</span>)
    expect(r.props.children[2]).toEqual(<span key='c' className='inline-block highlight'>c</span>)
  })

  it('does nothing on click since not selected', function () {
    r.props.onClick(evSpy)
    expect(r.props.children.length).toBe(3)
  })

  describe('when clicked and is selected', function () {
    beforeEach(function () {
      renderer.render(<TagsComponent file={file} isSelected={true} />)
      r = renderer.getRenderOutput()
      r.props.onClick(evSpy)
      r = renderer.getRenderOutput() // to get updated output
    })

    it('should render an edit component instead', function () {
      expect(r.props.children.type.displayName).toEqual('edit-component')
    })
  })
})
