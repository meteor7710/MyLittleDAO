// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


/** @title A voting system contract
    @author LE GOFF Loic
    @notice You can use this contract to manage a vote session with or without asset
    @dev 
*/
contract MyLittleDAO is Ownable {

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

    /** @notice This event is emitted when the variable maxVoteSession is modified.
        @param oldMaxVoteSession The old max vote session limit.
        @param newMaxVoteSession The new max vote session limit.*/ 
    event maxVoteSessionModification(uint64 oldMaxVoteSession,uint64 newMaxVoteSession);


    /** @notice This event is emitted when a bad call is received.
        @param sessionID The new session ID.*/ 
    event sessionCreated(uint sessionID);

    /** @notice This event is emitted when admin session is transferred.
        @param sessionID The session ID.
        @param oldAdmin The old session admin.
        @param newAdmin The new session admin.*/ 
    event sessionAdminTransferred(uint sessionID, address oldAdmin, address newAdmin);

    /************** Modifier definitions **************/

    modifier isSessionAdmin(uint _sessionID){  
        require ( msg.sender == voteSessions[_sessionID].sessionAdmin ,"You are not the session admin");
        _;
    }


    /************** Getters **************/

    /** @notice Get vote session informations.
        @dev Retrieve session attributes.
        @param _id The session ID to query.
        @return Session The sessions informations*/
    function getSession (uint _id) external view returns (Session memory) {
       return voteSessions[_id];
    }



    /************** Functions **************/

    /** @notice Set the max Vote Session available.
        @dev Set state variable maxVoteSession.
        @param _max The new max session number.*/
    function setMaxVoteSession (uint64 _max) public  onlyOwner {
        uint64 oldMaxVoteSession = maxVoteSession;
        maxVoteSession = _max;
        emit maxVoteSessionModification(oldMaxVoteSession,_max);
    }

    /** @notice Create a new vote session.
        @dev Session creator is set has admin.
        @dev Global session count is incremented.
        @param _title The new vote session Title.
        @param _voteType The new vote type (SimpleVote, PotVote,AdminVote).*/
    function createnewVoteSession (string calldata _title, VoteType _voteType ) external   {
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

    /** @notice Change vote session admin.
        @dev Only session admin can transfer adminship.
        @dev Session adminship can not be transfered to 0x0 or actual admin address.
        @param _address The new vote session admin address.
        @param _sessionID The vote session ID to  transfer.*/
    function transferSessionAdmin (address _address, uint _sessionID ) external isSessionAdmin(_sessionID)  {
        require(_address != address(0), "New admin can't be the zero address");
        require(_address != voteSessions[_sessionID].sessionAdmin, "New admin can't be the actual admin");
        
        address oldAdmin = voteSessions[_sessionID].sessionAdmin;
        voteSessions[_sessionID].sessionAdmin = _address;

        emit sessionAdminTransferred(_sessionID, oldAdmin, _address);
    }







}
