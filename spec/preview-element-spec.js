/* @flow */

import PreviewElement from "../lib/preview-element";

describe("preview-element", function() {
  let preview;

  beforeEach(function() {
    preview = new PreviewElement();
  });

  afterEach(function() {
    preview.dispose();
  });

  it("should have a title compatible for tab panes", function() {
    expect(preview.getTitle()).toEqual(jasmine.any(String));
    expect(preview.getLongTitle()).toEqual(jasmine.any(String));
  });

  describe("when preview is updated", function() {
    let html;

    beforeEach(function() {
      preview.updatePreview("/test/path.txt", "foo\nbar\nbaz", /ba/);
      html = preview.innerHTML;
    });

    it("should render content", function() {
      expect(html).toContain("foo");
    });

    it("should highlight matches", function() {
      expect(html).toMatch(/<span class=".+">ba<\/span>r/);
      expect(html).toMatch(/<span class=".+">ba<\/span>z/);
    });

    it("should render new lines", function() {
      expect(html).toContain("<br>");
    });

    it("should have a path", function() {
      expect(preview.getPath()).toEqual("/test/path.txt");
    });
  });
});
