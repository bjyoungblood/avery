'use strict';

import _ from 'lodash';
import Joi from 'joi';
import { Record as record } from 'immutable';
import assert from 'assert';

const optionsSchema = Joi.object().keys({
  defaults : Joi.object().unknown().required(),
  validate : Joi.object().unknown().optional().default(Joi.any()),
  virtuals : Joi.object().unknown().pattern(/.+/, Joi.func()).optional().default({}),
});

export default function factory(options) {

  let valid = Joi.validate(options, optionsSchema);

  if (valid.error) {
    throw valid.error;
  }

  let { defaults, validate, virtuals } = valid.value;

  assert(validate.isJoi, 'validate must be a Joi object');

  let allKeys = _.keys(defaults).concat(_.keys(virtuals));
  let unique = allKeys.length === _.unique(allKeys).length;

  assert(unique, 'Attribute names must be unique');

  class AveryModel extends record(defaults) {
    constructor(values) {
      super(values);

      this.init();
    }

    init() {
      this._isValid = null;
      this._cachedVirtuals = {};
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

    _validate() {
      Joi.validate(this.toObject(), validate, (err, value) => {
        this._isValid = ! err;
      });
    }

    isValid() {
      if (this._isValid === null) {
        this._validate();
      }

      return this._isValid;
    }

    _getVirtual(key) {
      if (! this._cachedVirtuals.hasOwnProperty(key)) {
        this._cachedVirtuals[key] = virtuals[key].apply(this);
      }

      return this._cachedVirtuals[key];
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

  AveryModel.validate = validate;
  AveryModel.virtuals = virtuals;

  return AveryModel;
}
