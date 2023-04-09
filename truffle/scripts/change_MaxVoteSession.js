
const MyLittleDAO = artifacts.require("MyLittleDAO");

module.exports = async function (callback) {

  const instance = await MyLittleDAO.deployed();

  const oldMaxVoteSession = await instance.maxVoteSession();
  await instance.setMaxVoteSession(400000);
  const newMaxVoteSession = await instance.maxVoteSession();
  console.log("Old max session: " + oldMaxVoteSession.toString() + " New max session : " + newMaxVoteSession.toString());

  callback();
};
