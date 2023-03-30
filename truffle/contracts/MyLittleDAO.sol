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

    /************** Enumartions definitions **************/
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
        address sessionAdmin;
    }

    struct Proposal {
        string description;
        uint16 voteCount;
    }

    /** @notice Initialize default contract values
        @dev maxVoteSession and maxVoter are initialized */
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

    /** @notice Default function for bad call
        @dev Emit an even when bad call is received */
    fallback () external payable {
        emit badCallReceived(msg.sender,msg.value);
    }

    /************** Events definitions **************/

    /** @notice This event is emitted when a transfer is received.
        @param voterAddress The source account.
        @param amount The amount received. */
    event transferReceived(address voterAddress, uint amount);

    /** @notice This event is emitted when a bad call is received.
        @param voterAddress The source account.
        @param amount The amount received. */ 
    event badCallReceived(address voterAddress, uint amount);

    /** @notice This event is emitted when a bad call is received.
        @param sessionID The new session ID.*/ 
    event sessionCreated(uint sessionID);

    /************** Modifier definitions **************/



    /************** Getters **************/

    /** @notice Get vote session informations.
        @dev Retrieve session attributes.
        @param _id The session ID to query.
        @return Session The sessions informations*/
    function getSession (uint _id) external view returns (Session memory) {
       return voteSessions[_id];
    }


    /** @notice Create a new vote session.
        @dev Session is set has admin.
        @dev Global session count is incremented.
        @param _title The new vote session Title.
        @param _voteType The new vote type (SimpleVote, PotVote,AdminVote).*/
    function createnewVoteSession (string calldata _title, VoteType _voteType ) external  {
        require(keccak256(abi.encode(_title)) != keccak256(abi.encode("")), "Title can not be empty");

        uint currentSessionId = currentVoteSession;  
        currentVoteSession = ++currentVoteSession;

        Session memory newSession;
        newSession.sessionAdmin = msg.sender;
        newSession.title = _title;
        newSession.voteType = _voteType;

        voteSessions.push(newSession);
        
        emit sessionCreated(currentSessionId);
    }
}
