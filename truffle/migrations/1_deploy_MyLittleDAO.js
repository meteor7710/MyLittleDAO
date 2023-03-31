const MyLittleDAO = artifacts.require("MyLittleDAO");

module.exports = async function (deployer) {
  await deployer.deploy(MyLittleDAO);
  const instance = await MyLittleDAO.deployed();
  const oldMaxVoteSession = await instance.maxVoteSession();
  await instance.setMaxVoteSession(10001);
  const newMaxVoteSession = await instance.maxVoteSession();

  console.log("Old max session: " + oldMaxVoteSession.toString() + " New max session : " + newMaxVoteSession.toString());

};
