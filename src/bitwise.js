export default function BitWise(numbers) {
  return {
    shift: i => BitWise(numbers.map(num => num >>> i)),
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
