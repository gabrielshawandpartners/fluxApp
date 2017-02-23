import _ from 'lodash';

export default class DispatchError extends Error {
  constructor(err) {
    super(_.isString(err) ? err : err.message);

    if (! _.isString(err)) {
      _.assign(this, err);
      this.message = err.message;
      this.stack = err.stack || new Error().stack;
    } else {
      this.message = err;
      this.state = new Error().stack;
    }

    this.name = this.constructor.name;
  }
};
