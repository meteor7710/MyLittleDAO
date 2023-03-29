const MyLittleDAO = artifacts.require("MyLittleDAO");

module.exports = function (deployer) {
  deployer.deploy(MyLittleDAO);
};
