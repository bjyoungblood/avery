'use strict';

import _ from 'lodash';
import Joi from 'joi';
import { Record as record } from 'immutable';
import assert from 'assert';

export default function create(options) {

  assert(_.isObject(options), 'Model options must be an object');

  var { name, defaults, validate, virtuals } = options;

  assert(name, 'All models must be named');
  assert(_.isObject(defaults), 'You must provide default values to a model');

  if (validate) {
    assert(_.isObject(validate), 'validate must be an object');
    assert(validate.isJoi, 'validate must be a Joi object');
  }

  if (virtuals) {
    var virtualsUnique = _.intersection(_.keys(virtuals), _.keys(defaults)).length === 0;
    assert(virtualsUnique, 'Cannot have a virtual property with the name of an actual property');
    assert(_.isEqual(_.functions(virtuals), _.keys(virtuals)), 'All virtuals must be a function');
  } else {
    virtuals = {};
  }

  let RecordType = record(defaults, name);

  class AveryModel extends RecordType {
    constructor(values) {
      super(values);

      this.init();
    }

    init() {
      this._validate();
      this._cachedVirtuals = {};
    }

    _validate() {
      if (! validate) {
        this._isValid = true;
        return;
      }

      Joi.validate(this.toObject(), validate, (err, value) => {
        if (err) {
          this._isValid = false;
        } else {
          this._isValid = true;
        }
      });
    }

    isValid() {
      return this._isValid;
    }

    _getVirtual(key) {
      if (! this._cachedVirtuals.hasOwnProperty(key)) {
        this._cachedVirtuals[key] = virtuals[key].apply(this);
      }

      return this._cachedVirtuals[key];
    }

    has(key) {
      return super.has(key) || this.hasVirtual(key);
    }

    hasVirtual(key) {
      return virtuals.hasOwnProperty(key);
    }

    get(key) {
      if (this.hasVirtual(key)) {
        return this._getVirtual(key);
      }

      return super.get(key);
    }

    set(key, value) {
      if (this.hasVirtual(key)) {
        throw new Error('Cannot set virtual key "' + key + '" on ' + this._name);
      }

      var newRecord = super.set(key, value);
      newRecord.init();
      return newRecord;
    }

    remove(key) {
      if (this.hasVirtual(key)) {
        throw new Error('Cannot remove virtual key "' + key + '" on ' + this._name);
      }

      var newRecord = super.remove(key);
      newRecord.init();
      return newRecord;
    }

    __ensureOwner(ownerId) {
      var sup = super.__ensureOwner(ownerId);
      if (sup === this) {
        return sup;
      }

      sup.init();
      return sup;
    }
  }

  AveryModel.modelName = name;
  AveryModel.validate = validate;

  return AveryModel;
}
