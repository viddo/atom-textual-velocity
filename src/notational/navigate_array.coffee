# Return expected modulo for negative a's too.
# see http://javascript.about.com/od/problemsolving/a/modulobug.htm
_modulo = (x, y)->
  ((x % y) + y) % y;

_byOffset = (array, offset) ->
  array[_modulo(offset, array.length)]


# Helper methods to navigate an array
module.exports =
  # @param array {Array}
  # @param offset {Number}
  # @return {Object} object on given offset. Will cycle items if offset is larger than array size
  byOffset: _byOffset

  # Find item relatively offset to matched object in predicateFn
  # If relativeOffset is negative will always return first item.
  # If relativeOffset is out-of-bounds will always return last item.
  #
  # @param array {Array}
  # @param relativeOffset {Number} offset relative to item matched by predicateFn
  # @param predicateFn {Function} fn will be called for each item until it returns true
  # @return {Object,undefined} Object offset to matched object by predicateFn.
  #   If there is no match by predicateFn will return nothing.
  byRelativeOffset: (array, relativeOffset, predicateFn) ->
    for item, i in array
      if predicateFn(item)
        offset = relativeOffset + i
        if 0 <= offset < array.length
          # offset within bounds of array, return item on offset
          return array[offset]
        else if offset < 0
          # offset is out of lower bounds, stay on first item instead of cycle array
          return array[0]
        else
          # offset is out of higher bounds, stay on last item instead of don't cycle array
          return _byOffset(array, -1)
        break

