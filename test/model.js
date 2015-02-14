/* global describe, it, beforeEach */
'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var Joi = require('joi');

var averyModel = require('../dist/model');

describe('factory', function() {
  it('throws with invalid params', function() {
    expect(averyModel).to.throw();
  });

  it('throws with invalid validate object', function() {
    var params = {
      defaults : {},
      validate : 'test'
    };

    expect(averyModel.bind(null, params)).to.throw();
  });

  it('throws with a conflicting default and virtual', function() {
    var params = {
      defaults : { id : null },
      virtuals : { id : function() {} }
    };

    expect(averyModel.bind(null, params)).to.throw();
  });

  it('throws with a non-function virtual', function() {
    var params = {
      defaults : { id : null },
      virtuals : { value : 'test' }
    };

    expect(averyModel.bind(null, params)).to.throw();
  });
});

describe('AveryModel', function() {

  var Model;
  var idValueVirtSpy;
  var nameValueVirtSpy;

  beforeEach(function() {
    idValueVirtSpy = sinon.spy(function() {
      return '' + this.get('id') + this.get('value');
    });

    nameValueVirtSpy = sinon.spy(function() {
      return '' + this.get('name') + this.get('value');
    });

    Model = averyModel({
      defaults : {
        id : null,
        name : null,
        value : null,
      },
      validate : Joi.object().keys({
        id : Joi.number().integer(),
        name : Joi.string(),
        value : Joi.any(),
      }),
      virtuals : {
        idValue : idValueVirtSpy,
        nameValue : nameValueVirtSpy,
      }
    });
  });

  it('is immutable', function() {
    var model = new Model({
      id : 1,
      name : 'Name',
      value : 'MyValue',
    });

    var model2 = model.set('name', 'not name');

    expect(model.get('name')).to.equal('Name');
    expect(model).to.not.equal(model2);

    var model3 = model.remove('name');

    expect(model.get('name')).to.equal('Name');
    expect(model).to.not.equal(model3);
  });

  it('works with no optional config items defined', function() {
    var Model2 = averyModel({
      defaults : {
        id : null,
        name : null,
        value : null,
      },
    });

    var model = new Model2({
      id : 1,
      name : 'Name',
      value : 'value'
    });

    expect(model.get('name')).to.equal('Name');
    expect(model.has('value')).to.be.true;
  });

  describe('setters and getters', function() {
    it('sets and gets', function() {
      var model = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue',
      });

      expect(model.get('id')).to.equal(1);
      expect(model.get('name')).to.equal('Name');
      expect(model.get('value')).to.equal('MyValue');
    });
  });

  describe('validation', function() {
    it('isValid returns correctly', function() {
      var valid = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue'
      });

      expect(valid.isValid()).to.be.true;

      var invalid = new Model({
        id : 1,
        name : 5,
        value : 4
      });

      expect(invalid.isValid()).to.be.false;
    });
  });

  describe('virtuals', function() {
    it('virtuals return correct values', function() {
      var model = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue'
      });

      expect(model.get('idValue')).to.equal('1MyValue');
    });

    it('virtuals are only called once', function() {
      var model = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue',
      });

      expect(idValueVirtSpy.called).to.equal(false);
      expect(nameValueVirtSpy.called).to.equal(false);

      expect(model.get('idValue')).to.equal('1MyValue');

      expect(idValueVirtSpy.callCount).to.equal(1);
      expect(nameValueVirtSpy.called).to.equal(false);

      expect(model.get('nameValue')).to.equal('NameMyValue');

      expect(idValueVirtSpy.callCount).to.equal(1);
      expect(nameValueVirtSpy.callCount).to.equal(1);

      expect(model.get('idValue')).to.equal('1MyValue');
      expect(model.get('nameValue')).to.equal('NameMyValue');

      expect(idValueVirtSpy.callCount).to.equal(1);
      expect(nameValueVirtSpy.callCount).to.equal(1);

      model.set('id', 2);
      model.get('idValue');

      expect(idValueVirtSpy.callCount).to.equal(1);
      expect(nameValueVirtSpy.callCount).to.equal(1);
    });

    it('throws when trying to set a virtual', function() {
      var model = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue',
      });

      expect(model.set.bind(model, 'idValue', 2)).to.throw();
    });

    it('throws when trying to remove a virtual', function() {
      var model = new Model({
        id : 1,
        name : 'Name',
        value : 'MyValue',
      });

      expect(model.remove.bind(model, 'idValue')).to.throw();
    });
  });
});
