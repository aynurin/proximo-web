
export function subarray<T>(arr: Array<T>, lowEdge: (item: T) => boolean, highEdge: (item: T) => boolean) {
  if (arr == null) {
    return null;
  }
  let start = edgeSearch(arr, lowEdge);
  let end = edgeSearch(arr, highEdge);
  if (start == -1 || end == -1) {
    return [];
  } else {
    if (start == -2) {
      start = 0;
    }
    if (end == -2) {
      end = arr.length - 1;
    }
  }
  return arr.slice(start, end + 1);
}

/**
 * Searches for a boundary within an array. Accepts a comparer that tells `true` from `false` and returns the index of the `true` closest to a `false`.
 * The function assumes that there is only one boundary. If there is more than one, the function will return any of the boundaries.
 * For example:
 *    arr: [1, 1, 1, 2, 2, 2]
 *    comparer: x => x == 2
 * the function will return 3 because arr[3] is the first `true` after the `false` series.
 * @param arr array to search within
 * @param comparer a comparer function that tells "black from white"
 * @param startIndex an inclusive start index limitation if any
 * @param endIndex an exclusive end index limitation if any
 */
export function edgeSearch<T>(arr: Array<T>, comparer: (ob: T) => boolean, startIndex: number = 0, endIndex: number = -1) {
  if (arr == null) {
    // console.debug("arr == null");
    return -1;
  }
  if (endIndex < 0 || endIndex >= arr.length) {
    endIndex = arr.length;
  }
  if (startIndex < 0) {
    startIndex = 0;
  }
  if (startIndex >= arr.length) {
    // console.debug("startIndex >= arr.length");
    return -1;
  }
  let zeroCheck = comparer(arr[startIndex]);
  let maxiCheck = comparer(arr[endIndex - 1]);
  if (zeroCheck === false && maxiCheck === false) {
    // console.debug("zeroCheck === false && maxiCheck === false");
    return -1; // no edge and all is false
  } else if (zeroCheck === true && maxiCheck === true) {
    // console.debug("zeroCheck === true && maxiCheck === true");
    return -2; // no edge and all is true
  }
  let step = Math.trunc((endIndex - startIndex) / 10);
  if (step == 0) {
    step = 1;
  }
  let lastResult = null;
  for (let i = startIndex; i < endIndex; i += step) {
    let result = comparer(arr[i]);
    if (lastResult == null) {
      lastResult = result;
    } else if (lastResult != result) {
      if (step == 1) {
        if (result === true) {
          return i;
        } else {
          return i - step;
        }
      } else {
        return edgeSearch(arr, comparer, i - step, i);
      }
    }
  }
  // console.debug("over and out");
  return -1;
}
