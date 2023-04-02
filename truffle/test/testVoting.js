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
    });

    //Initial state variables tests
    describe("Intial state variables modifications", () => {

        it("owner can change maxVoteSession", async () => {
            expect(await votingInstance.setMaxVoteSession(100, { from: _owner }));
            expect(await votingInstance.maxVoteSession.call()).to.be.bignumber.equal("100");
        });

        it("non-owner can't change change maxVoteSession", async () => {
            await expectRevert(votingInstance.setMaxVoteSession(100, { from: _voter1 }), 'Ownable: caller is not the owner');
        });

        it("event is correctly emmited when maxVoteSession is modified", async () => {
            const evenTx = await votingInstance.setMaxVoteSession(100, { from: _owner });
            await expectEvent(evenTx, "maxVoteSessionModification", { oldMaxVoteSession: BN(10000), newMaxVoteSession: BN(100) });
        });
    });

    //Session tests
    describe("Session tests", () => {

        describe("Session creation tests", () => {
            it("everyone can start a session", async () => {
                expect(await votingInstance.createnewVoteSession("Session 1", 0, { from: _voter1 }));
                expect(await votingInstance.createnewVoteSession("Session 2", 1, { from: _voter2 }));
                expect(await votingInstance.createnewVoteSession("Session 3", 2, { from: _voter3 }));
            });

            it("a session title can't be empty", async () => {
                await expectRevert(votingInstance.createnewVoteSession("", 0, { from: _voter1 }), "Title can not be empty");
            });

            it("session attributes are correctly stored", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await votingInstance.createnewVoteSession("Session 1", 1, { from: _voter1 });
                await votingInstance.createnewVoteSession("Session 2", 2, { from: _voter1 });
                const session0 = await votingInstance.getSession.call(0, { from: _voter1 });
                const session1 = await votingInstance.getSession.call(1, { from: _voter1 });
                const session2 = await votingInstance.getSession.call(2, { from: _voter1 });
                expect(session0.title).to.equal("Session 0");
                expect(session0.sessionAdmin).to.equal(_voter1);
                expect(session0.voteType).to.be.bignumber.equal("0");
                expect(session0.workflowStatus).to.be.bignumber.equal("0");
                expect(session1.title).to.equal("Session 1");
                expect(session1.voteType).to.be.bignumber.equal("1");
                expect(session2.title).to.equal("Session 2");
                expect(session2.voteType).to.be.bignumber.equal("2");
            });

            it("currentVoteSession is correctly incremented", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _voter1 });
                expect(await votingInstance.currentVoteSession.call()).to.be.bignumber.equal("1");
                await votingInstance.createnewVoteSession("Session 2", 1, { from: _voter2 });
                expect(await votingInstance.currentVoteSession.call()).to.be.bignumber.equal("2");
                await votingInstance.createnewVoteSession("Session 3", 2, { from: _voter3 });
                expect(await votingInstance.currentVoteSession.call()).to.be.bignumber.equal("3");
            });

            it("maxVoteSession blocks new session creation", async () => {
                await votingInstance.setMaxVoteSession(1, { from: _owner });
                expect(await votingInstance.createnewVoteSession("Session 1", 0, { from: _voter1 }));
                await expectRevert(votingInstance.createnewVoteSession("Session 2", 1, { from: _voter1 }), "Max vote session reached");
            });

            it("event is correctly emmited when a session is created", async () => {
                const evenTx = await votingInstance.createnewVoteSession("Session 1", 0, { from: _voter1 });
                await expectEvent(evenTx, "sessionCreated", { sessionID: BN(0) });
                const evenTx2 = await votingInstance.createnewVoteSession("Session 2", 1, { from: _voter2 });
                await expectEvent(evenTx2, "sessionCreated", { sessionID: BN(1) });
            });
        })

        describe("Session get information tests", () => {
            it("admin can get session information", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                expect(await votingInstance.getSession( 0, { from: _voter1 }));
            });

            it("voter can get session information", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await votingInstance.addVoter(_voter2, 0, { from: _voter1 });
                expect(await votingInstance.getSession( 0, { from: _voter2 }));
            });

            it("admin and voter can't get information tests of an unexisting session", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await expectRevert(votingInstance.getSession( 1, { from: _voter1 }), "Session doesn't exist");
                await expectRevert(votingInstance.getSession( 1, { from: _voter2 }), "Session doesn't exist");
            });

            it("non-voter can't get session information", async () => {
                
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await expectRevert(votingInstance.getSession( 0, { from: _nonVoter }), "You're not a voter or admin of this session");
            });
        })

        describe("Session adminship transfer tests", () => {
            it("admin can transfer adminship", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                expect(await votingInstance.transferSessionAdmin(_voter2, 0, { from: _voter1 }));
            });

            it("non-admin can't transfer adminship", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await expectRevert(votingInstance.transferSessionAdmin(_voter2, 0, { from: _voter2 }), "You are not the session admin");
            });

            it("admin can't transfer adminship to adress 0", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await expectRevert(votingInstance.transferSessionAdmin("0x0000000000000000000000000000000000000000", 0, { from: _voter1 }), "New admin can't be the zero address");
            });

            it("admin can't transfer adminship to itself", async () => {
                await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
                await expectRevert(votingInstance.transferSessionAdmin(_voter1, 0, { from: _voter1 }), "New admin can't be the actual admin");
            });

            it("admin can't transfer adminship of an unexisting session", async () => {
                await expectRevert(votingInstance.transferSessionAdmin(_voter1, 1, { from: _voter1 }), "Session doesn't exist");
            });

            it("event is correctly emmited when a session adminship is transfered", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _voter1 });
                const evenTx = await votingInstance.transferSessionAdmin(_voter2, 0, { from: _voter1 })
                await expectEvent(evenTx, "sessionAdminTransferred", { sessionID: BN(0), oldAdmin: _voter1, newAdmin: _voter2 });
            });
        }) 
    });

    //Voters tests
    describe("Voter tests", () => {
        beforeEach(async () => {
            await votingInstance.createnewVoteSession("Session 0", 0, { from: _voter1 });
        });
        describe("Add voter tests", () => {
            
            it("admin can add voters", async () => {
                expect(await votingInstance.addVoter(_voter2, 0, { from: _voter1 }));
            });

            it("non-admin can't add voters", async () => {
                await expectRevert(votingInstance.addVoter(_voter2, 0, { from: _nonVoter }), "You are not the session admin");
            });

            it("admin can't add voters to an unexisting session", async () => {
                await expectRevert(votingInstance.addVoter(_voter2, 1, { from: _voter1 }), "Session doesn't exist");
            });

            it("admin can't add voters when status is not RegisteringVoters", async () => {
                await votingInstance.changeWorkflowStatus( 0, { from: _voter1 });
                await expectRevert(votingInstance.addVoter(_voter2, 0, { from: _voter1 }), "Session status is not correct");
            });

            it("event is correctly emmited when a voter is added", async () => {
                const evenTx = await votingInstance.addVoter(_voter2, 0, { from: _voter1 });
                await expectEvent(evenTx, "VoterRegistered", { voterAddress: _voter2, sessionID: BN(0) });
                const evenTx2 = await votingInstance.addVoter(_voter3, 0, { from: _voter1 });
                await expectEvent(evenTx2, "VoterRegistered", { voterAddress: _voter3, sessionID: BN(0) });
            });
        });
        describe("Remove voter tests", () => {
            beforeEach(async () => {
                await votingInstance.addVoter(_voter2, 0, { from: _voter1 });
            });
            
            it("admin can remove voters", async () => {
                expect(await votingInstance.removeVoter(_voter2, 0, { from: _voter1 }));
            });

            it("non-admin can't remove voters", async () => {
                await expectRevert(votingInstance.removeVoter(_voter2, 0, { from: _nonVoter }), "You are not the session admin");
            });

            it("admin can't remove voters to an unexisting session", async () => {
                await expectRevert(votingInstance.removeVoter(_voter2, 1, { from: _voter1 }), "Session doesn't exist");
            });

            it("admin can't remove voters when status is not RegisteringVoters", async () => {
                await votingInstance.changeWorkflowStatus( 0, { from: _voter1 });
                await expectRevert(votingInstance.removeVoter(_voter2, 0, { from: _voter1 }), "Session status is not correct");
            });

            it("event is correctly emmited when a voter is removed", async () => {
                await votingInstance.addVoter(_voter3, 0, { from: _voter1 });
                const evenTx = await votingInstance.removeVoter(_voter2, 0, { from: _voter1 });
                await expectEvent(evenTx, "VoterUnregistered", { voterAddress: _voter2, sessionID: BN(0) });
                const evenTx2 = await votingInstance.removeVoter(_voter3, 0, { from: _voter1 });
                await expectEvent(evenTx2, "VoterUnregistered", { voterAddress: _voter3, sessionID: BN(0) });
            });
        });



    });





    //Getters tests

});