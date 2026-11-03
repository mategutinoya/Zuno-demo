/** Bottle dimensions in scene units. Total height ≈ 3.44 (a 300 ml long-neck). */
export const BOTTLE = {
  bodyRadius: 0.5,
  bottom: -1.8,
  top: 1.64,
  get height() {
    return this.top - this.bottom;
  },
  /** vertical offset that centres the bottle around y = 0 */
  get centerOffset() {
    return -(this.top + this.bottom) / 2;
  },
  fillLevel: 0.6,
};

export const LABEL = {
  radius: 0.506,
  height: 1.36,
  centerY: -0.9,
  /** fraction of the circumference covered */
  arc: 0.6,
  get aspect() {
    return (2 * Math.PI * this.radius * this.arc) / this.height;
  },
};
