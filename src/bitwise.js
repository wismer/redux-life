const DEFAULT_STAMP = [7, 5, 7];

function bitCount(n) {
  let c = 0;
  while (n !== 0) {
    n &= (n - 1);
    c++;
  }

  return c;
}

export function BitWise(numbers) {
  return {
    reduce: (fn, integer) => {
      for (var i = 0; i < 32; i++) {
        let n = 0;
        let bits = BitWise(numbers.map(num => num >>> i - 1));
        let count = bits.count();
        if (bits.isAlive(i)) {
          // cell dies / lives
          n = count < 2 || count > 3 ? 0 : 1;
        } else if (count === 3) {
          // dead cell comes to life
          n = 1;
        }

        integer = fn(integer, n, i);
      }

      return integer;
    },
    inspect: () => {
      return '\n' + numbers.map(n => {
        let nstring = n.toString(2);
        if (nstring.length < 32) {
          return '0'.repeat(32 - nstring.length) + nstring;
        }
        return nstring;
      }).join('\n');
    },

    count: (outer = 7, inner = 5) => {
      let x = 0;
      numbers.forEach((n, i) => {
        if (i === 1) {
          x |= (inner & n);
        } else {
          x |= (outer & n);
        }
        x <<= 3;
      });

      return bitCount(x);
    },

    isAlive: () => ((numbers[1] >> 1) & 1) === 1
  };
}

export function BitMap(nums) {
  return {
    map: f => nums.map((n, i) => f([nums[i - 1] || 0, n, nums[i + 1] || 0], i)),
    isMoving: () => bitCount(nums[nums.length - 1]) > 8,
    stamp: (x, y, stamp = DEFAULT_STAMP) => {
      stamp = stamp.slice();
      return nums.map((n, i) => {
        if (stamp.length > 0 && i >= x - 1) {
          return n ^ (stamp.pop() << y - 1);
        }

        return n;
      });
    }
  };
}
