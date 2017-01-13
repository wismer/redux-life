export function BitWise(numbers) {
  return {
    shift: i => BitWise(numbers.map(num => num >>> i)),
    reduce: (f, i, n) => {
      let bits = BitWise(numbers.map(num => num >>> i));
      let c = bits.count(7, 5);
      if (bits.isAlive(i)) {
        if (c < 2 || c > 3) {
          // dies
        } else {
          n = n ^ (1 << i);
          // lives
        }
      } else if (c === 3) {
        n = n ^ (1 << i);
        // dead cell becomes alive
      }

      bits = bits.shift(i === 0 || i === 31 ? 0 : 1);

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
    map: f => {
      return BitMap(nums.map((n, i) => {
        return f(BitWise([nums[i - 1] || 0, n, nums[i + 1] || 0]));
      }));
    },
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
