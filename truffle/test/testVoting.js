const MyLittleDAO = artifacts.require("./MyLittleDAO.sol");
const { BN, constants, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("MyLittleDAO tests", accounts => {

    const _owner = accounts[0];
    const _sessionAdmin = accounts[1];
    const _voter2 = accounts[2];
    const _voter3 = accounts[3];
    const _voter4 = accounts[4];
    const _nonVoter = accounts[9];

    let votingInstance;

    beforeEach(async () => {
        votingInstance = await MyLittleDAO.new({ from: _owner });
    });


    //Initial state variables tests
    describe("Intial state variables tests", () => {

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
            await expectRevert(votingInstance.setMaxVoteSession(100, { from: _sessionAdmin }), "Ownable: caller is not the owner");
        });

        it("owner can change setMaxVoterperSession", async () => {
            expect(await votingInstance.setMaxVoterperSession(10, { from: _owner }));
            expect(await votingInstance.maxVoterperSession.call()).to.be.bignumber.equal("10");
        });

        it("non-owner can't change change setMaxVoterperSession", async () => {
            await expectRevert(votingInstance.setMaxVoterperSession(100, { from: _sessionAdmin }), "Ownable: caller is not the owner");
        });

        it("owner can change setMaxProposalperSession", async () => {
            expect(await votingInstance.setMaxProposalperSession(15, { from: _owner }));
            expect(await votingInstance.maxProposalperSession.call()).to.be.bignumber.equal("15");
        });

        it("non-owner can't change change setMaxProposalperSession", async () => {
            await expectRevert(votingInstance.setMaxProposalperSession(100, { from: _sessionAdmin }), "Ownable: caller is not the owner");
        });

        it("event is correctly emmited when maxVoteSession is modified", async () => {
            const evenTx = await votingInstance.setMaxVoteSession(100, { from: _owner });
            await expectEvent(evenTx, "maxVoteSessionModification", { oldMaxVoteSession: BN(10000), newMaxVoteSession: BN(100) });
        });

        it("event is correctly emmited when maxVoterperSessionModification is modified", async () => {
            const evenTx = await votingInstance.setMaxVoterperSession(10, { from: _owner });
            await expectEvent(evenTx, "maxVoterperSessionModification", { oldMaxVoterperSession: BN(100), newMaxVoterperSession: BN(10) });
        });

        it("event is correctly emmited when maxProposalperSessionModification is modified", async () => {
            const evenTx = await votingInstance.setMaxProposalperSession(15, { from: _owner });
            await expectEvent(evenTx, "maxProposalperSessionModification", { oldMaxProposalperSession: BN(100), newMaxProposalperSession: BN(15) });
        });

    });

    //Session tests
    describe("Session tests", () => {

        describe("Session creation tests", () => {
            it("everyone can start a session", async () => {
                expect(await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin }));
                expect(await votingInstance.createnewVoteSession("Session 2", 1, { from: _voter2 }));
                expect(await votingInstance.createnewVoteSession("Session 3", 2, { from: _voter3 }));
            });

            it("a session title can't be empty", async () => {
                await expectRevert(votingInstance.createnewVoteSession("", 0, { from: _sessionAdmin }), "Title can not be empty");
            });

            it("session attributes are correctly stored", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.createnewVoteSession("Session 2", 1, { from: _sessionAdmin });
                await votingInstance.createnewVoteSession("Session 3", 2, { from: _sessionAdmin });
                const session1 = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                const session2 = await votingInstance.getSession.call(2, { from: _sessionAdmin });
                const session3 = await votingInstance.getSession.call(3, { from: _sessionAdmin });
                expect(session1.title).to.equal("Session 1");
                expect(session1.sessionAdmin).to.equal(_sessionAdmin);
                expect(session1.voteType).to.be.bignumber.equal("0");
                expect(session1.workflowStatus).to.be.bignumber.equal("0");
                expect(session1.sessionVoters).to.be.bignumber.equal("0");
                expect(session2.title).to.equal("Session 2");
                expect(session2.voteType).to.be.bignumber.equal("1");
                expect(session3.title).to.equal("Session 3");
                expect(session3.voteType).to.be.bignumber.equal("2");
            });

            it("maxVoteSession blocks new session creation", async () => {
                await votingInstance.setMaxVoteSession(1, { from: _owner });
                expect(await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin }));
                await expectRevert(votingInstance.createnewVoteSession("Session 2", 1, { from: _sessionAdmin }), "Max vote session reached");
            });

            it("event is correctly emmited when a session is created", async () => {
                const evenTx = await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await expectEvent(evenTx, "sessionCreated", { sessionID: BN(1) });
                const evenTx2 = await votingInstance.createnewVoteSession("Session 2", 1, { from: _voter2 });
                await expectEvent(evenTx2, "sessionCreated", { sessionID: BN(2) });
            });
        })

        describe("Session get information tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
            });

            it("admin can get session information", async () => {
                expect(await votingInstance.getSession(1, { from: _sessionAdmin }));
            });

            it("voter can get session information", async () => {
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                expect(await votingInstance.getSession(1, { from: _voter2 }));
            });

            it("admin and voter can't get information tests of an unexisting session", async () => {
                await expectRevert(votingInstance.getSession(2, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getSession(2, { from: _voter2 }), "Session doesn't exist");
            });

            it("non-voter can't get session information", async () => {
                await expectRevert(votingInstance.getSession(1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("session attributes are correctly returned", async () => {
                await votingInstance.createnewVoteSession("Session 2", 1, { from: _sessionAdmin });
                await votingInstance.createnewVoteSession("Session 3", 2, { from: _sessionAdmin });
                const session1 = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                const session2 = await votingInstance.getSession.call(2, { from: _sessionAdmin });
                const session3 = await votingInstance.getSession.call(3, { from: _sessionAdmin });
                expect(session1.title).to.equal("Session 1");
                expect(session1.sessionAdmin).to.equal(_sessionAdmin);
                expect(session1.voteType).to.be.bignumber.equal("0");
                expect(session1.workflowStatus).to.be.bignumber.equal("0");
                expect(session1.sessionVoters).to.be.bignumber.equal("0");
                expect(session2.title).to.equal("Session 2");
                expect(session2.voteType).to.be.bignumber.equal("1");
                expect(session3.title).to.equal("Session 3");
                expect(session3.voteType).to.be.bignumber.equal("2");
            });
        })

        describe("Session adminship transfer tests", () => {
            it("admin can transfer adminship", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                expect(await votingInstance.transferSessionAdmin(_voter2, 1, { from: _sessionAdmin }));
            });

            it("non-admin can't transfer adminship", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await expectRevert(votingInstance.transferSessionAdmin(_voter2, 1, { from: _voter2 }), "You are not the session admin");
            });

            it("admin can't transfer adminship to adress 0", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await expectRevert(votingInstance.transferSessionAdmin("0x0000000000000000000000000000000000000000", 1, { from: _sessionAdmin }), "New admin can't be the zero address");
            });

            it("admin can't transfer adminship to itself", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await expectRevert(votingInstance.transferSessionAdmin(_sessionAdmin, 1, { from: _sessionAdmin }), "New admin can't be the actual admin");
            });

            it("admin can't transfer adminship of an unexisting session", async () => {
                await expectRevert(votingInstance.transferSessionAdmin(_sessionAdmin, 2, { from: _sessionAdmin }), "Session doesn't exist");
            });

            it("event is correctly emmited when a session adminship is transfered", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                const evenTx = await votingInstance.transferSessionAdmin(_voter2, 1, { from: _sessionAdmin })
                await expectEvent(evenTx, "sessionAdminTransferred", { sessionID: BN(1), oldAdmin: _sessionAdmin, newAdmin: _voter2 });
            });
        })
    });

    //Voters tests
    describe("Voter tests", () => {
        beforeEach(async () => {
            await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
        });
        describe("Add voter tests", () => {

            it("admin can add voters", async () => {
                expect(await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin }));
            });

            it("non-admin can't add voters", async () => {
                await expectRevert(votingInstance.addVoter(_voter2, 1, { from: _nonVoter }), "You are not the session admin");
            });

            it("admin can't add voters to an unexisting session", async () => {
                await expectRevert(votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin }), "Session doesn't exist");
            });

            it("admin can't add voters when status is not RegisteringVoters", async () => {
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin })
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await expectRevert(votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin }), "Session status is not correct");
            });

            it("event is correctly emmited when a voter is added", async () => {
                const evenTx = await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await expectEvent(evenTx, "VoterRegistered", { voterAddress: _voter2, sessionID: BN(1) });
                const evenTx2 = await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await expectEvent(evenTx2, "VoterRegistered", { voterAddress: _voter3, sessionID: BN(1) });
            });

            it("sessionVoters is correctly incremented", async () => {
                let session = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                expect(await session.sessionVoters).to.be.bignumber.equal("0");
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                session = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                expect(await session.sessionVoters).to.be.bignumber.equal("1");
            });

            it("maxVoterperSession blocks new voters", async () => {
                await votingInstance.setMaxVoterperSession(1, { from: _owner });
                expect(await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin }));
                await expectRevert(votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin }), "Max voter per session reached");
            });
        });

        describe("Remove voter tests", () => {
            beforeEach(async () => {
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
            });

            it("admin can remove voters", async () => {
                expect(await votingInstance.removeVoter(_voter2, 1, { from: _sessionAdmin }));
            });

            it("non-admin can't remove voters", async () => {
                await expectRevert(votingInstance.removeVoter(_voter2, 1, { from: _nonVoter }), "You are not the session admin");
            });

            it("admin can't remove voters to an unexisting session", async () => {
                await expectRevert(votingInstance.removeVoter(_voter2, 2, { from: _sessionAdmin }), "Session doesn't exist");
            });

            it("admin can't remove voters when status is not RegisteringVoters", async () => {
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await expectRevert(votingInstance.removeVoter(_voter2, 1, { from: _sessionAdmin }), "Session status is not correct");
            });

            it("event is correctly emmited when a voter is removed", async () => {
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                const evenTx = await votingInstance.removeVoter(_voter2, 1, { from: _sessionAdmin });
                await expectEvent(evenTx, "VoterUnregistered", { voterAddress: _voter2, sessionID: BN(1) });
                const evenTx2 = await votingInstance.removeVoter(_voter3, 1, { from: _sessionAdmin });
                await expectEvent(evenTx2, "VoterUnregistered", { voterAddress: _voter3, sessionID: BN(1) });
            });

            it("sessionVoters is correctly decremented", async () => {
                let session = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                expect(await session.sessionVoters).to.be.bignumber.equal("1");
                await votingInstance.removeVoter(_voter2, 1, { from: _sessionAdmin })
                session = await votingInstance.getSession.call(1, { from: _sessionAdmin });
                expect(await session.sessionVoters).to.be.bignumber.equal("0");
            });
        });
    });

    //Proposal tests
    describe("Proposal tests", () => {
        
        describe("Proposal creation tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            });

            it("voter can create a proposal", async () => {
                expect(await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 }));
                expect(await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter3 }));
            });

            it("non-voter can't create a proposal", async () => {
                await expectRevert(votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _sessionAdmin }), "You're not voter");
                await expectRevert(votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _nonVoter }), "You're not voter");
            });

            it("proposal description can't be empty", async () => {
                await expectRevert(votingInstance.registerProposal("", 1,0,0, { from: _voter2 }), "Description can not be empty");
            });

            it("proposal attributes are correctly stored", async () => {
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 });
                await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter3 });
                const prop1 = await votingInstance.getProposal.call(1, 1, { from: _sessionAdmin });
                const prop2 = await votingInstance.getProposal.call(2, 1, { from: _sessionAdmin });

                expect(prop1.description).to.equal("Proposal 1");
                expect(prop1.voteCount).to.be.bignumber.equal("0");
                expect(prop2.description).to.equal("Proposal 2");
                expect(prop2.voteCount).to.be.bignumber.equal("0");
            });

            it("maxProposalperSession blocks new proposal creation", async () => {
                await votingInstance.setMaxProposalperSession(1, { from: _owner });
                expect(await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 }));
                await expectRevert(votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter3 }), "Max proposal per session reached");
            });

            it("event is correctly emmited when a proposal is created", async () => {
                const evenTx = await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 });
                await expectEvent(evenTx, "ProposalRegistered", { proposalId: BN(1), sessionID: BN(1) });
                const evenTx2 = await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter2 });
                await expectEvent(evenTx2, "ProposalRegistered", { proposalId: BN(2), sessionID: BN(1) });
            });


            it("admin proposal attributes are correctly stored", async () => {
                await votingInstance.createnewVoteSession("Session 2", 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                
                await votingInstance.registerProposal("Proposal 1", 2,1,10000, { from: _voter2 });
                await votingInstance.registerProposal("Proposal 2", 2,2,20000, { from: _voter3 });
                const prop1 = await votingInstance.getAdminProposal.call(1, 2, { from: _sessionAdmin });
                const prop2 = await votingInstance.getAdminProposal.call(2, 2, { from: _sessionAdmin });

                expect(prop1.setting).to.be.bignumber.equal("1");
                expect(prop1.value).to.be.bignumber.equal("10000");
                expect(prop1.applied).to.be.false;
                expect(prop2.setting).to.be.bignumber.equal("2");
                expect(prop2.value).to.be.bignumber.equal("20000");
                expect(prop2.applied).to.be.false;
            });
        });

        describe("Proposal get information tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 });
                await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter3 });
            });

            it("admin can get proposal information", async () => {
                expect(await votingInstance.getProposal.call(1, 1, { from: _sessionAdmin }));
                expect(await votingInstance.getProposal.call(2, 1, { from: _sessionAdmin }));
            });

            it("voter can get proposal information", async () => {
                expect(await votingInstance.getProposal.call(1, 1, { from: _voter3 }));
                expect(await votingInstance.getProposal.call(2, 1, { from: _voter2 }));
            });

            it("admin and voter can't get proposal information of an unexisting session", async () => {
                await expectRevert(votingInstance.getProposal.call(1, 11, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getProposal.call(1, 11, { from: _voter2 }), "Session doesn't exist");
            });

            it("admin and voter can't get proposal information of an unexisting proposal", async () => {
                await expectRevert(votingInstance.getProposal.call(10, 1, { from: _sessionAdmin }), "Proposal doesn't exist");
                await expectRevert(votingInstance.getProposal.call(10, 1, { from: _voter2 }), "Proposal doesn't exist");
            });

            it("non-voter can't get proposal information", async () => {
                await expectRevert(votingInstance.getProposal.call(1, 1, { from: _nonVoter }), "You're not voter/admin");
                await expectRevert(votingInstance.getProposal.call(2, 1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("proposal information are correctly returned", async () => {
                const prop1 = await votingInstance.getProposal.call(1, 1, { from: _sessionAdmin });
                const prop2 = await votingInstance.getProposal.call(2, 1, { from: _sessionAdmin });

                expect(prop1.description).to.equal("Proposal 1");
                expect(prop1.voteCount).to.be.bignumber.equal("0");
                expect(prop2.description).to.equal("Proposal 2");
                expect(prop2.voteCount).to.be.bignumber.equal("0");
            });
        });

        describe("Admin proposal get information tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,1,200, { from: _voter2 });
                await votingInstance.registerProposal("Proposal 2", 1,2,400, { from: _voter3 });;
            });

            it("admin can get admin proposal information", async () => {
                expect(await votingInstance.getAdminProposal.call(1, 1, { from: _sessionAdmin }));
                expect(await votingInstance.getAdminProposal.call(2, 1, { from: _sessionAdmin }));
            });

            it("voter can get admin proposal information", async () => {
                expect(await votingInstance.getAdminProposal.call(1, 1, { from: _voter3 }));
                expect(await votingInstance.getAdminProposal.call(2, 1, { from: _voter2 }));
            });

            it("admin and voter can't get admin proposal information of an unexisting session", async () => {
                await expectRevert(votingInstance.getAdminProposal.call(1, 11, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getAdminProposal.call(1, 11, { from: _voter2 }), "Session doesn't exist");
            });

            it("admin and voter can't get admin proposal information of an unexisting proposal", async () => {
                await expectRevert(votingInstance.getAdminProposal.call(10, 1, { from: _sessionAdmin }), "Proposal doesn't exist");
                await expectRevert(votingInstance.getAdminProposal.call(10, 1, { from: _voter2 }), "Proposal doesn't exist");
            });

            it("non-voter can't get admin proposal information", async () => {
                await expectRevert(votingInstance.getAdminProposal.call(1, 1, { from: _nonVoter }), "You're not voter/admin");
                await expectRevert(votingInstance.getAdminProposal.call(2, 1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("admin proposal information are correctly returned", async () => {
                const prop1 = await votingInstance.getAdminProposal.call(1, 1, { from: _sessionAdmin });
                const prop2 = await votingInstance.getAdminProposal.call(2, 1, { from: _sessionAdmin });

                expect(prop1.setting).to.be.bignumber.equal("1");
                expect(prop1.value).to.be.bignumber.equal("200");
                expect(prop1.applied).to.be.false;
                expect(prop2.setting).to.be.bignumber.equal("2");
                expect(prop2.value).to.be.bignumber.equal("400");
                expect(prop2.applied).to.be.false;
            });
        });
    });

    //Donations tests
    describe("Donations tests", () => {
        beforeEach(async () => {
            await votingInstance.createnewVoteSession("Session 1", 1, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter4, 1, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
        });

        describe("Donations creation tests", () => {

            it("donation can't be done to an unexisting session", async () => {
                await expectRevert(votingInstance.sendDonation(10, { from: _voter2, value: 1000000000000000000 }), "Session doesn't exist");
            });

            it("voter can donate", async () => {
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
                expect(await votingInstance.sendDonation(1, { from: _voter3, value: 1000000000000000000 }));
            });

            it("non-voter can't donate", async () => {
                await expectRevert(votingInstance.sendDonation(1, { from: _sessionAdmin, value: 1000000000000000000 }), "You're not voter");
                await expectRevert(votingInstance.sendDonation(1, { from: _nonVoter, value: 1000000000000000000 }), "You're not voter");
            });

            it("only PotVote session accept donation", async () => {
                await votingInstance.createnewVoteSession("Session 2", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.createnewVoteSession("Session 3", 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 3, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(3, { from: _sessionAdmin });
                await expectRevert(votingInstance.sendDonation(2, { from: _voter2, value: 1000000000000000000 }), "Session doesn't accept donation");
                await expectRevert(votingInstance.sendDonation(3, { from: _voter2, value: 1000000000000000000 }), "Session doesn't accept donation");
            });

            it("validate session status that accepts donations", async () => {
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
            });

            it("validate session status that doesn't accept donations", async () => {
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await expectRevert(votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }), "Session status is not correct for donations");
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await expectRevert(votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }), "Session status is not correct for donations");
            });

            it("donation must not be 0", async () => {
                await expectRevert(votingInstance.sendDonation(1, { from: _voter2, value: 0 }), "Donations must be greater than 0");
            });

            it("donation is credited on smartcontract", async () => {
                const balance1 = await web3.eth.getBalance(votingInstance.address) ;
                expect(balance1).to.be.bignumber.equal("0");
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
                const balance2 = await web3.eth.getBalance(votingInstance.address);
                expect(balance2).to.be.bignumber.equal("1000000000000000000");
            });

            it("donation is credited on mapping", async () => {
                const donation1 =await votingInstance.getVoterDonations.call(_voter2, 1, { from: _voter2 });
                expect(donation1).to.be.bignumber.equal("0");
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                const donation2 = await votingInstance.getVoterDonations.call(_voter2, 1, { from: _voter2 });
                expect(donation2).to.be.bignumber.equal("1000000000000000000");
            });

            it("voter can donate several time", async () => {
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
                expect(await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }));
            });

            it("donations are cumulated on mapping", async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                const donation = await votingInstance.getVoterDonations.call(_voter2, 1, { from: _voter2 });
                expect(donation).to.be.bignumber.equal("2000000000000000000");
            });

            it("session donations are cumulated on mapping", async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter3, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter4, value: 3000000000000000000 });
                const donation = await votingInstance.getSessionDonations.call( 1, { from: _voter2 });
                expect(donation).to.be.bignumber.equal("5000000000000000000");
            });

            it("voters can't donate after voting", async () => {
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 })
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.submitVote(1,1, { from: _voter2 });
                await expectRevert(votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 }), "You have already voted");
            });

            it("event is correctly emmited when a donation is done", async () => {
                const evenTx = await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await expectEvent(evenTx, "DonationRegistered", { amount: BN("1000000000000000000"), addr: _voter2, sessionID: BN(1) });
                const evenTx2 = await votingInstance.sendDonation(1, { from: _voter3, value: 2000000000000000000 });
                await expectEvent(evenTx2, "DonationRegistered", { amount: BN("2000000000000000000"), addr: _voter3, sessionID: BN(1) });
            });
        });

        describe("Voter donations get information tests", () => {
            beforeEach(async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter3, value: 1000000000000000000 });
            });

            it("admin can get donations information", async () => {
                expect(await votingInstance.getVoterDonations.call(_voter2, 1, { from: _sessionAdmin }));
                expect(await votingInstance.getVoterDonations.call(_voter3, 1, { from: _sessionAdmin }));
            });

            it("voter can get donations information", async () => {
                expect(await votingInstance.getVoterDonations.call(_voter2, 1, { from: _voter2 }));
                expect(await votingInstance.getVoterDonations.call(_voter3, 1, { from: _voter2 }));
            });

            it("admin and voter can't get donations information of an unexisting session", async () => {
                await expectRevert(votingInstance.getVoterDonations.call(_voter2, 11, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getVoterDonations.call(_voter2, 11, { from: _voter2 }), "Session doesn't exist");
            });

            it("non-voter can't get donations information", async () => {
                await expectRevert(votingInstance.getVoterDonations.call(_voter2, 1, { from: _nonVoter }), "You're not voter/admin");
                await expectRevert(votingInstance.getVoterDonations.call(_voter3, 1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("donations are correctly returned", async () => {
                const donation1 = await votingInstance.getVoterDonations.call(_voter2, 1, { from: _voter2 });
                const donation2 = await votingInstance.getVoterDonations.call(_voter3, 1, { from: _voter2 }) ;
                const donation3 = await votingInstance.getVoterDonations.call(_voter4, 1, { from: _voter2 }) ;
                expect(donation1).to.be.bignumber.equal("1000000000000000000");
                expect(donation2).to.be.bignumber.equal("1000000000000000000");
                expect(donation3).to.be.bignumber.equal("0");
            });
        });

        describe("Session donations get information tests", () => {
            beforeEach(async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter3, value: 1000000000000000000 });
            });

            it("admin can get donations information", async () => {
                expect(await votingInstance.getSessionDonations.call(1, { from: _sessionAdmin }));
            });

            it("voter can get donations information", async () => {
                expect(await votingInstance.getSessionDonations.call(1, { from: _voter2 }));
            });

            it("admin and voter can't get donations information of an unexisting session", async () => {
                await expectRevert(votingInstance.getSessionDonations.call(11, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getSessionDonations.call(11, { from: _voter2 }), "Session doesn't exist");
            });

            it("non-voter can't get donations information", async () => {
                await expectRevert(votingInstance.getSessionDonations.call(1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("donations are correctly returned", async () => {
                const donation = await votingInstance.getSessionDonations.call(1, { from: _voter2 });
                expect(donation).to.be.bignumber.equal("2000000000000000000");
            });
        });
    });

    //Votes tests
    describe("Votes tests", () => {

        describe("Votes generic tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter4, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 3", 1,0,0, { from: _voter2 })
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            });

            it("vote submission can't be done to an unexisting session", async () => {
                await expectRevert(votingInstance.submitVote(1,10, { from: _voter2}), "Session doesn't exist");
            });

            it("voter can submit vote", async () => {
                expect(await votingInstance.submitVote(1,1, { from: _voter2}));
                expect(await votingInstance.submitVote(1,1, { from: _voter3}));
            });

            it("non-voter can't submit vote", async () => {
                await expectRevert(votingInstance.submitVote(1,1, { from: _sessionAdmin}), "You're not voter");
                await expectRevert(votingInstance.submitVote(1,1, { from: _nonVoter}), "You're not voter");
            });

            it("voter can submit vote only in status VotingSessionStarted", async () => {
                await votingInstance.createnewVoteSession("Session 2", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 2, { from: _sessionAdmin });
                await expectRevert(votingInstance.submitVote(1,2, { from: _voter2}), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 2,0,0, { from: _voter2 })
                await expectRevert(votingInstance.submitVote(1,2, { from: _voter2}), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.submitVote(1,2, { from: _voter2}), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                expect(await votingInstance.submitVote(1,2, { from: _voter2}));
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.submitVote(1,2, { from: _voter3}), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.submitVote(1,2, { from: _voter3}), "Session status is not correct");
            });

            it("voter can only vote once", async () => {
                expect(await votingInstance.submitVote(1,1, { from: _voter2}));
                await expectRevert(votingInstance.submitVote(1,1, { from: _voter2}), "You have already voted");
            });

            it("voter can't vote for an unexisting proposal", async () => {
                await expectRevert(votingInstance.submitVote(10,1, { from: _voter3}), "Proposal doesn't exist");
            });

            it("event is correctly emmited when a vote is submitted", async () => {
                const evenTx = await votingInstance.submitVote(1,1, { from: _voter2});
                await expectEvent(evenTx, "VoteSubmitted", { proposalID: BN(1), voter: _voter2, sessionID: BN(1) });
                const evenTx2 = await votingInstance.submitVote(2,1, { from: _voter3});
                await expectEvent(evenTx2, "VoteSubmitted", { proposalID: BN(2), voter: _voter3,sessionID: BN(1) });
            });
        });

        describe("Votes without vote power tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter4, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 3", 1,0,0, { from: _voter2 })
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            });

            it("validate votes are correctly stored on proposals", async () => {
                await votingInstance.submitVote(1,1, { from: _voter2});
                await votingInstance.submitVote(2,1, { from: _voter3});
                await votingInstance.submitVote(1,1, { from: _voter4});
                const prop1 = await votingInstance.getProposal.call(1, 1, { from: _sessionAdmin });
                const prop2 = await votingInstance.getProposal.call(2, 1, { from: _sessionAdmin });
                const prop3 = await votingInstance.getProposal.call(3, 1, { from: _sessionAdmin });
                expect(prop1.voteCount).to.be.bignumber.equal("2");
                expect(prop2.voteCount).to.be.bignumber.equal("1");
                expect(prop3.voteCount).to.be.bignumber.equal("0");
            });

            it("validate winning proposal is correctly updated", async () => {
                let win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("0");
                await votingInstance.submitVote(1,1, { from: _voter2});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("1");
                await votingInstance.submitVote(2,1, { from: _voter3});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("1");
                await votingInstance.submitVote(2,1, { from: _voter4});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("2");
            });
        });

        describe("Votes with vote power tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter4, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 2", 1,0,0, { from: _voter2 })
                await votingInstance.registerProposal("Proposal 3", 1,0,0, { from: _voter2 })
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            });

            it("voter can submit vote if they have donate", async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                expect(await votingInstance.submitVote(1,1, { from: _voter2}));
            });

            it("voter can't submit vote if they haven't donate", async () => {
                await expectRevert( votingInstance.submitVote(1,1, { from: _voter2}),"You must have donate to vote");
            });

            it("validate votes are correctly stored on proposals", async () => {
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter3, value: 5000000000000000000 });
                await votingInstance.sendDonation(1, { from: _voter4, value: 1500000000000000000 });
                await votingInstance.submitVote(1,1, { from: _voter2});
                await votingInstance.submitVote(2,1, { from: _voter3});
                await votingInstance.submitVote(3,1, { from: _voter4});
                const prop1 = await votingInstance.getProposal.call(1, 1, { from: _sessionAdmin });
                const prop2 = await votingInstance.getProposal.call(2, 1, { from: _sessionAdmin });
                const prop3 = await votingInstance.getProposal.call(3, 1, { from: _sessionAdmin });
                expect(prop1.voteCount).to.be.bignumber.equal("1000000000000000000");
                expect(prop2.voteCount).to.be.bignumber.equal("5000000000000000000");
                expect(prop3.voteCount).to.be.bignumber.equal("1500000000000000000");
            });

            it("validate winning proposal is correctly updated", async () => {
                let win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("0");
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.submitVote(1,1, { from: _voter2});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("1");
                await votingInstance.sendDonation(1, { from: _voter3, value: 1000000000000000000 });
                await votingInstance.submitVote(2,1, { from: _voter3});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("1");
                await votingInstance.sendDonation(1, { from: _voter4, value: 3000000000000000000 });
                await votingInstance.submitVote(3,1, { from: _voter4});
                win = await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin });
                expect(win).to.be.bignumber.equal("3");
            });
        });

        describe("Winning proposal get information tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
            });

            it("admin can get donations information", async () => {
                expect(await votingInstance.getWinningProposal.call(1, { from: _sessionAdmin }));
            });

            it("voter can get donations information", async () => {
                expect(await votingInstance.getWinningProposal.call(1, { from: _voter2 }));
            });

            it("admin and voter can't get winning proposal of an unexisting session", async () => {
                await expectRevert(votingInstance.getWinningProposal.call(11, { from: _sessionAdmin }), "Session doesn't exist");
                await expectRevert(votingInstance.getWinningProposal.call(11, { from: _voter2 }), "Session doesn't exist");
            });

            it("non-voter can't get donations information", async () => {
                await expectRevert(votingInstance.getWinningProposal.call(1, { from: _nonVoter }), "You're not voter/admin");
            });

            it("winning proposalID correctly returned", async () => {
                const ID = await votingInstance.getWinningProposal.call(1, { from: _voter2 }) ;
                expect(ID).to.be.bignumber.equal("0");
            });
        });
    });
    
    //Withdraw tests
    describe("Withdraw tests", () => {

        describe("Withdrawer tests", () => {

            it("withdrawer is set at PotVote session creation", async () => {
                await votingInstance.createnewVoteSession("Session 1", 1, { from: _sessionAdmin });
                const withdrawer = await votingInstance.getSessionWithdrawer.call (1, { from: _sessionAdmin });
                expect(withdrawer).to.be.equal(_sessionAdmin);
            });

            it("withdrawer is not set at none PotVote session creation", async () => {
                await votingInstance.createnewVoteSession("Session 1", 0, { from: _sessionAdmin });
                const withdrawer1 = await votingInstance.getSessionWithdrawer (1, { from: _sessionAdmin });
                await votingInstance.createnewVoteSession("Session 2", 2, { from: _sessionAdmin });
                const withdrawer2 = await votingInstance.getSessionWithdrawer (2, { from: _sessionAdmin });
                expect(withdrawer1).to.be.equal("0x0000000000000000000000000000000000000000");
                expect(withdrawer2).to.be.equal("0x0000000000000000000000000000000000000000");
            });
        });

        describe("Withdraw tests", () => {
            beforeEach(async () => {
                await votingInstance.createnewVoteSession("Session 1", 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1", 1,0,0, { from: _voter2 })
                await votingInstance.sendDonation(1, { from: _voter2, value: 1000000000000000000 });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.submitVote(1,1, { from: _voter2});
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            });

            it("withdraw can't be done to an unexisting session", async () => {
                await expectRevert(votingInstance.sessionWithdraw(11, { from: _sessionAdmin }), "Session doesn't exist");
            });

            it("voter can withdraw donations only in status VotesTallied", async () => {
                await votingInstance.createnewVoteSession("Session 2", 1, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter3, 2, { from: _sessionAdmin });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1",2,0,0, { from: _voter2 })
                await votingInstance.sendDonation(2, { from: _voter2, value: 1000000000000000000 });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }), "Session status is not correct");
                expect(await votingInstance.submitVote(1,2, { from: _voter2}));
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }), "Session status is not correct");
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                expect(await votingInstance.sessionWithdraw(2, { from: _sessionAdmin }));
            });

            it("whitdrawer can withdraw donations", async () => {
                expect(await votingInstance.sessionWithdraw(1, { from: _sessionAdmin }));
            });

            it("non-whitdrawer can't withdraw donations", async () => {
                await expectRevert(votingInstance.sessionWithdraw(1, { from: _voter2 }),"You are not allowed to withdraw");
            });

            it("whitdrawer can't withdraw in non-PotVote VoteType", async () => {
                await votingInstance.createnewVoteSession("Session 2", 0, { from: _sessionAdmin });
                await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.registerProposal("Proposal 1",2,0,0, { from: _voter2 })
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
                await expectRevert(votingInstance.sessionWithdraw(2, { from: _sessionAdmin }),"You are not in a withdrawable session");
            });

            it("whitdrawer can withdraw donations only once", async () => {
                expect(await votingInstance.sessionWithdraw(1, { from: _sessionAdmin }));
                await expectRevert (votingInstance.sessionWithdraw(1, { from: _sessionAdmin }),"You have already withdrawed");
            });

            it("donation is debitted on smartcontract", async () => {
                const balance1 = await web3.eth.getBalance(votingInstance.address) ;
                expect(balance1).to.be.bignumber.equal("1000000000000000000");
                await votingInstance.sessionWithdraw(1, { from: _sessionAdmin });
                const balance2 = await web3.eth.getBalance(votingInstance.address);
                expect(balance2).to.be.bignumber.equal("0");
            });

            it("donation is credited on withdrawer", async () => {
                const balance1 = await web3.eth.getBalance(_sessionAdmin) ;
                await votingInstance.sessionWithdraw(1, { from: _sessionAdmin });
                const balance2 = await web3.eth.getBalance(_sessionAdmin);
                expect(balance2).to.be.bignumber.above(balance1);
            });

            it("event is correctly emmited when a withdrawal is done", async () => {
                const evenTx =  await votingInstance.sessionWithdraw(1, { from: _sessionAdmin });
                await expectEvent(evenTx, "WithdrawalSubmitted", { amount: BN("1000000000000000000"), withdrawer: _sessionAdmin, sessionID: BN(1) });
            });
        });
    });

    //Apply admin vote tests
    describe("Apply admin vote tests", () => {

        beforeEach(async () => {
            await votingInstance.createnewVoteSession("Session 1", 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter2, 1, { from: _sessionAdmin });
            await votingInstance.addVoter(_owner, 1, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            await votingInstance.registerProposal("Proposal 1", 1,1,400, { from: _voter2 })
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            await votingInstance.submitVote(1,1, { from: _voter2});
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(1, { from: _sessionAdmin });
        });

        it("apply vote can't be done to an unexisting session", async () => {
            await expectRevert(votingInstance.applyVote(11, { from: _sessionAdmin }), "Session doesn't exist");
        });

        it("owner can apply vote", async () => {
            expect(await votingInstance.applyVote(1, { from: _owner }));
        });

        it("non-owner can't apply vote", async () => {
            await expectRevert(votingInstance.applyVote(1, { from: _voter2 }),"Ownable: caller is not the owner");
        });

        it("owner can't apply vote in non-AdminVote VoteType", async () => {
            await votingInstance.createnewVoteSession("Session 2", 0, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_owner, 2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.registerProposal("Proposal 1",2,0,0, { from: _voter2 })
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.submitVote(1,2, { from: _voter2});
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await expectRevert(votingInstance.applyVote(2, { from: _owner }),"You are not in a admin vote session");
        });

        it("owner can apply vote only once", async () => {
            expect(await votingInstance.applyVote(1, { from: _owner }));
            await expectRevert (votingInstance.applyVote(1, { from: _owner }),"Already applied");
        });


        it("vote maxProposalperSession is applied", async () => {
            await votingInstance.applyVote(1, { from: _owner });
            expect(await votingInstance.maxProposalperSession.call()).to.be.bignumber.equal("400");
        });

        it("vote maxVoterperSession is applied", async () => {
            await votingInstance.createnewVoteSession("Session 2", 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_owner, 2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.registerProposal("Proposal 1", 2,2,800, { from: _voter2 })
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.submitVote(1,2, { from: _voter2});
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.applyVote(2, { from: _owner });
            expect(await votingInstance.maxVoterperSession.call()).to.be.bignumber.equal("800");
        });

        it("event is correctly emmited when a apply vote is done", async () => {
            const evenTx =  await votingInstance.applyVote(1, { from: _owner });
            await expectEvent(evenTx, "SettingsApplied", { setting: BN(1), value: BN(400), sessionID: BN(1) });
            await votingInstance.createnewVoteSession("Session 2", 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_voter2, 2, { from: _sessionAdmin });
            await votingInstance.addVoter(_owner, 2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.registerProposal("Proposal 1", 2,2,800, { from: _voter2 })
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.submitVote(1,2, { from: _voter2});
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            await votingInstance.changeWorkflowStatus(2, { from: _sessionAdmin });
            const evenTx2 =  await votingInstance.applyVote(2, { from: _owner });
            await expectEvent(evenTx2, "SettingsApplied", { setting: BN(2), value: BN(800), sessionID: BN(2) });
        });
    });
});