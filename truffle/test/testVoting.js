const MyLittleDAO = artifacts.require("./MyLittleDAO.sol");
const { BN, constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("MyLittleDAO tests", accounts => {

    const _owner = accounts[0];
    const _voter1 = accounts[1];
    const _voter2 = accounts[2];
    const _voter3 = accounts[3];
    const _nonVoter = accounts[9];

    let votingInstance;

    beforeEach(async () => {
        votingInstance = await MyLittleDAO.new({ from: _owner });
    });


    //Initial state variables tests
    describe("Intial state variables tests", () => {

        it("has started currentVoteSession to 0", async () => {
            expect(await votingInstance.currentVoteSession.call()).to.be.bignumber.equal("0");
        });

        it("has started maxVoteSession to 10000", async () => {
            expect(await votingInstance.maxVoteSession.call()).to.be.bignumber.equal("10000");
        });

        it("has started maxProposalperSession to 100", async () => {
            expect(await votingInstance.maxProposalperSession.call()).to.be.bignumber.equal("100");
        });

        it("has started maxVoterperSession to 100", async () => {
            expect(await votingInstance.maxVoterperSession.call()).to.be.bignumber.equal("100");
        });
    })

    //Initial state variables tests
    describe("Intial state variables modifications", () => {

        it("owner can change maxVoteSession", async () => {
            expect(await votingInstance.setMaxVoteSession(100,{ from: _owner }));
            expect(await votingInstance.maxVoteSession.call()).to.be.bignumber.equal("100");
        });

        it("non-owner can't change change maxVoteSession", async () => {
            await expectRevert(votingInstance.setMaxVoteSession(100,{ from: _voter1 }), 'Ownable: caller is not the owner');
        });

        it("event is correctly emmited when maxVoteSession is modified", async () => {
            const changeStatus = await votingInstance.setMaxVoteSession(100,{ from: _owner });
            await expectEvent(changeStatus, "maxVoteSessionModification", { oldMaxVoteSession: BN(10000), newMaxVoteSession: BN(100) });
        });


    })



    
    //Getters tests

});