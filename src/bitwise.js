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

    toArray: () => numbers,
    count: (outer = 7, inner = 5) => {
      let c = 0;
      numbers.forEach((n, i) => {
        if (i === 1) {
          c |= (inner & n);
        } else {
          c |= (outer & n);
        }
        c <<= 3;
      });
      let count = 0;

      while (c !== 0) {
        c &= (c - 1);
        count++;
      }

      return count;
    },

    isAlive: () => ((numbers[1] >> 1) & 1) === 1
  };
}

export function BitMap(nums) {
  return {
    bitwise: i => BitWise([nums[i - 1] || 0, nums[i], nums[i + 1] || 0]),
    hash: f => nums.filter(a => a).map(f).join('-'),
    map: f => BitMap(nums.map(f)),
    fold: () => nums,
    bitmap: f => {
      let bitmap = 0;
      let hash = [];
      nums.forEach((num, idx) => {
        if (num) {
          bitmap ^= 1 << idx;
          hash.push(f(num));
        }
      });

      return {
        bitmap: bitmap ? `${f(bitmap)}#` + hash.join('-') : null,
        grid: nums
      };
    }
  };
}
