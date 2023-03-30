// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;


/** @title A voting system contract
    @author LE GOFF Loic
    @notice You can use this contract to manage a vote session with or without asset
    @dev 
*/
contract MyLittleDAO {

    /************** States variables definitions **************/
    uint64 public currentVoteSession;
    uint64 public maxVoteSession;
    uint16 public maxProposalperSession;
    uint16 public maxVoterperSession;

    Session[] voteSessions;

    /************** Mappings defnitions **************/
    mapping(uint8 => mapping(address => Voter)) voters;

    /************** Enumerations definitions **************/
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    enum VoteType {
        SimpleVote,
        PotVote,
        AdminVote
    }

    /************** Strutures definitions **************/
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint16 votedProposalId;
    }

    struct Session {
        string title;
        WorkflowStatus voteStatus;
        VoteType voteType;
        Proposal[] proposals;
    }

    struct Proposal {
        string description;
        uint16 voteCount;
    }

    /// @notice Initialize default contract values
    /// @dev maxVoteSession and maxVoter are initialized
    constructor (){

        maxVoteSession = 10000;
        maxProposalperSession = 100;
        maxVoterperSession = 100;
    }

    /// @notice Default function to receive coins
    /// @dev Emit an even when coins are received
    receive() external payable {
        emit transferReceived(msg.sender,msg.value);
    }

    /// @notice Default function for bad call
    /// @dev Emit an even when bad call is received
    fallback () external payable {
        emit badCallReceived(msg.sender,msg.value);
    }

    /************** Events definitions **************/
    event transferReceived(address voterAddress, uint amount); //Voter registration event
    event badCallReceived(address voterAddress, uint amount); //Voter registration event

}
