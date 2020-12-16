"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Harmonic = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Harmonic =
/*#__PURE__*/
function () {
  function Harmonic() {
    _classCallCheck(this, Harmonic);

    this.TAU = 6.28318530717958647692528676655901; // @constant {Number} 2 pi

    this.GAMMA = 0.5772156649015328606065120900824; // @constant {Number} lim_(n->infty)(H_n-lnn)

    this.ZETA2 = 1.64493406684822643647241516664603; // @constant {Number} zeta(2)

    this.TWOLN2 = 1.3862943611198906188344642429164; // @constant {Number} 2 ln(2)

    this.OMEGA = 0.031344688607245102605976487270816; // @constant {Number} 440 * pi/44100
    // @constant {Array} abs(ζ(1 - floor(2 k)))

    this.B2 = [1 / 12, 1 / 120, 1 / 252, 1 / 240, 1 / 132, 691 / 32760, 1 / 12, 3617 / 8160, 43867 / 14364, 174611 / 6600, 77683 / 276, 236364091 / 65520, 657931 / 12]; // @constant {Array} Numerators of harmonic numbers H(n) = Sum_{i=1..n} 1/i.

    /*this.HN0 = [
      1,
      3,
      11,
      25,
      137,
      49,
      363,
      761,
      7129,
      7381,
      83711,
      86021,
      1145993,
      1171733,
      1195757,
      2436559,
      42142223,
      14274301,
      275295799,
      55835135,
      18858053,
      19093197,
      444316699,
      1347822955,
      34052522467,
      34395742267,
      312536252003,
      315404588903,
      9227046511387,
    ];*/
    // @constant {Array} Denominators of harmonic numbers H(n) = Sum_{i=1..n} 1/i

    /*this.HN1 = [
      1,
      2,
      6,
      12,
      60,
      20,
      140,
      280,
      2520,
      2520,
      27720,
      27720,
      360360,
      360360,
      360360,
      720720,
      12252240,
      4084080,
      77597520,
      15519504,
      5173168,
      5173168,
      118982864,
      356948592,
      8923714800,
      8923714800,
      80313433200,
      80313433200,
      2329089562800,
    ];*/

    this.GAMMAINT = [0, 1, 3 / 2, 11 / 6, 25 / 12, 137 / 60, 49 / 20, 363 / 140, 761 / 280, 7129 / 2520, 7381 / 2520, 83711 / 27720];
    /*this.GAMMAINT_TEST_VALUES = [
      -0.5772156649015329,
      0.42278433509846713,
      0.9227843350984671,
      1.2561176684318003,
      1.5061176684318007,
      1.7061176684318005,
      1.8727843350984674,
      2.01564147795561,
      2.14064147795561,
      2.2517525890667214,
      2.351752589066721,
      2.4426616799758123,
    ];*/

    this.GAMMAHALFINT = [0, 2, 46 / 15, 352 / 105, 1126 / 315, 13016 / 3465, 176138 / 45045, 182144 / 45045, 3186538 / 765765, 62075752 / 14549535, 63461422 / 14549535, 1488711776 / 334639305];
    /*this.GAMMAHALFINT_TEST_VALUES = [
      -1.9635100260214235,
      0.03648997397857652,
      0.7031566406452432,
      1.103156640645243,
      1.388870926359529,
      1.611093148581751,
      1.792911330399933,
      1.9467574842460866,
      2.08009081757942,
      2.1977378764029494,
      2.303001034297686,
      2.398239129535781,
    ];*/
  }
  /**
   * Digamma function
   *
   * @param {Number} x
   * @return {Number}
   */

  /*digamma(b) {
    let c = 0;
    if (0 >= b && b === Math.round(b)) {
      return Infinity;
    }
    if (0 > b) {
      return this.digamma(1.0 - b) + Math.PI / Math.tan(-Math.PI * b);
    }
    if (b <= Number.EPSILON) {
      return (
        1.64493406684822643647241516664603 * b -
        1.0 / b +
        0.5772156649015328606065120900824
      );
    }
    for (; 8.0 > b; b += 1) {
      c -= 1.0 / b;
    }
    return (c +=
      Math.log(b) -
      0.5 / (b *= b) -
      (0.08333333333333333 -
        (0.008333333333333333 -
          (0.0039682539682539 - (0.004166666666666 - 1 / (132 * b)) / b) / b) /
          b) /
        b);
  }*/

  /**
   * Precision Digamma function
   *
   * @param {Number} x
   * @return {Number}
   */


  _createClass(Harmonic, [{
    key: "digamma12",
    value: function digamma12(x, PRECISION) {
      var v = 0;
      /* TODO: this should return Complex Infinity */

      if (Math.abs(x) < Number.EPSILON || Number.isInteger(x) && x < 0) {
        return Infinity;
      }
      /* Special values at positive integers (table lookup) */


      if (Number.isInteger(x) && x < 12) {
        var _v = this.GAMMAINT[x - 1] - this.GAMMA;

        return _v;
      }
      /* Special values at positive half-integers (table lookup) */


      if (Number.isInteger(x - 1 / 2) && x < 25 / 2) {
        var _v2 = this.GAMMAHALFINT[x - 1 / 2] - this.GAMMA - this.TWOLN2;

        return _v2;
      }
      /* Small values (0.000001) */


      if (Math.abs(x) <= 1e-6) {
        /* Positive x*/
        if (x > 0) {
          var _v3 = this.GAMMA - 1 / x + this.ZETA2; //x = x.toFixed(6);
          //console.log(`digamma12(${x}) => eulergamma - 1/${x} + zeta(2) => ${v} [recursion]`);


          return _v3;
        }
        /* Negative x */


        if (x < 0) {
          var _v4 = this.digamma12(1 - x) + Math.PI / Math.tan(-Math.PI * x); //x = x.toFixed(6);
          //console.log(`digamma12(${x}) => digamma12(1 - ${x}) + pi/tan(-pi * ${x}) => ${v} [reflection]`);


          return _v4;
        }
      }

      for (; PRECISION > x; x += 1) {
        v -= 1.0 / x;
      }

      return v += Math.log(x) - 0.5 / (x *= x) - (this.B2[0] - (this.B2[1] - (this.B2[2] - (this.B2[3] - (this.B2[4] - (this.B2[5] - (this.B2[6] - (this.B2[7] - (this.B2[8] - (this.B2[9] - (this.B2[10] - (this.B2[11] - this.B2[12] / x) / x) / x) / x) / x) / x) / x) / x) / x) / x) / x) / x) / x;
    }
    /**
     * Harmonic Number
     *
     * @param {Number} x
     * @return {Number}
     */

    /*H(x) {
      return this.digamma(++x) + this.GAMMA;
    }*/

    /**
     * Precision Harmonic Number
     *
     * @param {Number} x
     * @return {Number}
     */

  }, {
    key: "H12",
    value: function H12(x) {
      return this.digamma12(++x) + this.GAMMA;
    }
    /**
     * Precision Square Wave Approximation
     *
     * @param {Number} x
     * @param {Number} N Partials
     * @return {Number}
     */

  }, {
    key: "sqr12",
    value: function sqr12(x, N, P) {
      if (!P) P = 16;
      x *= this.OMEGA;
      var b = 8 * N * Math.cos(x);
      var v = Math.cos(this.TAU * b) * (this.digamma12(0.75 - b, P) - this.digamma12(0.25 - b, P)) / Math.PI - 1;
      return 0.5 * v;
    }
    /**
     * Precision Sawtooth Wave Approximation
     *
     * @param {Number} x
     * @param {Number} N Partials
     * @return {Number}
     */

  }, {
    key: "saw12",
    value: function saw12(x, N) {
      var v = Math.sin(x * this.OMEGA) * this.sqr12(x, N);
      return v;
    }
    /**
     * Precision Reverse Sawtooth Wave Approximation
     *
     * @param {Number} x
     * @param {Number} N Partials
     * @return {Number}
     */

  }, {
    key: "revsaw12",
    value: function revsaw12(x, N) {
      var v = Math.sin(x * this.OMEGA) * this.sqr12(x, -N);
      return v;
    }
    /**
     * Precision Triangle Wave Approximation
     * Note: it's a misnomer perhaps to call this a 'triangle' as
     * the overall shape tends more towards a smooth waveform, yet it
     * continues to maintain subtractive properties like a triangle.
     *
     * @param {Number} x
     * @param {Number} N
     * @return {Number}
     */

  }, {
    key: "tri12",
    value: function tri12(x, N) {
      var v = this.sqr12(x, N) * this.saw12(x, N);
      return 1.5 * v;
    }
    /**
     * Most basic lowpass filter
     *
     * @param {Number} x
     * @param {Number} n
     * @param {Number} z
     */

  }, {
    key: "lpf",
    value: function lpf(x, n, z) {
      if (!z) z = 0.998;
      return x + (n - x) * z;
    }
  }]);

  return Harmonic;
}();

exports.Harmonic = Harmonic;