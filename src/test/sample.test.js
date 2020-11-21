const { validEmail } = require('../services/user');
const chai = require('chai');

describe('Testing functions', () => {
  describe('validEmail() function', () => {
    it('Testing email juuso.huhtivuo@tuni.fi. Should be true', () => {
      chai.expect(validEmail('juuso.huhtivuo@tuni.fi')).to.be.true;
    })

    it('Testing email ex.example@utu.fi. Should be true', () => {
      chai.expect(validEmail('ex.example@utu.fi')).to.be.true;
    })
    
    it('Testing empty email string. Should be false', () => {
      chai.expect(validEmail('')).to.be.false;
    })

    it('Testing email juuso.tuni.fi. Should be false', () => {
      chai.expect(validEmail('juuso.tuni.fi')).to.be.false;
    })
    
    it('Testing email tuni.fi@juuso. Should be false', () => {
      chai.expect(validEmail('tuni.fi@juuso')).to.be.false;
    })
  })
})

describe('Sample tests', () => {
  it('Tests that true === true', () => {
    chai.expect(true).to.be.true;
  })
})
