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
    uint64 public maxVoteSession;
    uint16 public maxProposalperSession;
    uint16 public maxVoterperSession;

    Proposal[] voteProposals;
    uint64 private sessions;

    /************** Mappings defnitions **************/
    mapping(uint64 => mapping(address => Voter)) voters;
    mapping (uint64 => mapping (uint16 => uint)) sessionsProposals;
    mapping (uint64 => Session) voteSessions;

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
        address sessionAdmin;
        uint16 sessionVoters;
        WorkflowStatus workflowStatus;
        VoteType voteType;
    }

    struct Proposal {
        string description;
        uint16 voteCount;
        uint64 voteSession;
    }

    /** @notice Initialize default contract values
        @dev maxVoteSession and maxVoter are initialized */
    constructor (){
        maxVoteSession = 10000;
        maxProposalperSession = 100;
        maxVoterperSession = 100;

        Proposal memory genesisProposal = Proposal ("Genesis proposal",0,0);
        voteProposals.push(genesisProposal);
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

    /** @notice This event is emitted when the variable maxVoterperSession is modified.
        @param oldMaxVoterperSession The old max voter per session limit.
        @param newMaxVoterperSession The new max voter per session limit.*/ 
    event maxVoterperSessionModification(uint16 oldMaxVoterperSession,uint16 newMaxVoterperSession);

    /** @notice This event is emitted when the variable maxProposalperSession is modified.
        @param oldMaxProposalperSession The old max proposal per session limit.
        @param newMaxProposalperSession The new max proposal per session limit.*/ 
    event maxProposalperSessionModification(uint16 oldMaxProposalperSession,uint16 newMaxProposalperSession);


    /** @notice This event is emitted when a bad call is received.
        @param sessionID The new session ID.*/ 
    event sessionCreated(uint sessionID);

    /** @notice This event is emitted when admin session is transferred.
        @param sessionID The session ID.
        @param oldAdmin The old session admin.
        @param newAdmin The new session admin.*/ 
    event sessionAdminTransferred(uint sessionID, address oldAdmin, address newAdmin);

    /** @notice This event is emitted when a voter is registered.
        @param voterAddress The voter adress.
        @param sessionID The session ID.*/
    event VoterRegistered(address voterAddress, uint64 sessionID);

    /** @notice This event is emitted when a voter is removed.
        @param voterAddress The voter adress.
        @param sessionID The session ID.*/
    event VoterUnregistered(address voterAddress, uint64 sessionID);

    /** @notice This event is emitted a session workflowstatus is changed.
        @param previousStatus The session previous workflowstatus.
        @param newStatus The session new workflowstatus.
        @param sessionID The session ID.*/
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus,uint64 sessionID);  

    /** @notice This event is emitted when a proposal is registrered.
        @param proposalId The registered proposal ID.
        @param sessionID The session ID.*/
    event ProposalRegistered(uint16 proposalId,uint64 sessionID);

    /************** Modifier definitions **************/

    modifier isSessionAdmin(uint64 _sessionID){  
        require ( msg.sender == voteSessions[_sessionID].sessionAdmin ,"You are not the session admin");
        _;
    }

    modifier validateSession (uint64 _sessionID){
        require( _sessionID <= sessions, "Session doesn't exist");
        _;
    }

    modifier validateProposal (uint64 _proposalID, uint64 _sessionID){
        require( _proposalID <= getSessionCurrentProposalID (_sessionID), "Proposal doesn't exist");
        _;
    }

    modifier validateStatus (uint64 _sessionID, uint8 _status) { 
        require ( voteSessions[_sessionID].workflowStatus == WorkflowStatus(_status),"Session status is not correct");
        _;
    }

    modifier onlyAdminOrVoters(uint64 _sessionID) {
        require(voters[_sessionID][msg.sender].isRegistered || msg.sender == voteSessions[_sessionID].sessionAdmin, "You're not a voter or admin of this session");
        _;
    }

    modifier onlyVoters(uint64 _sessionID) {
        require(voters[_sessionID][msg.sender].isRegistered , "You're not a voter of this session");
        _;
    }


    /************** Getters **************/

    /** @notice Get vote session informations.
        @dev Retrieve session attributes.
        @param _id The session ID to query.
        @return Session The sessions informations*/

    function getSession (uint64 _id) external validateSession(_id) onlyAdminOrVoters(_id) view  returns (Session memory) {
       return voteSessions[_id];
    }

    /** @notice Get proposal informations.
        @dev Retrieve session attributes.
        @param _ProposalID The session ID to query.
        @param _SessionID The session ID to query.
        @return Session The sessions informations*/

    function getProposal (uint16 _ProposalID,uint64 _SessionID) external validateSession(_SessionID) validateProposal(_ProposalID,_SessionID) onlyAdminOrVoters(_SessionID) view  returns (Proposal memory) {
       return voteProposals[_ProposalID];
    }



    /************** Vote sessions **************/

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
        require(( sessions < maxVoteSession), "Max vote session reached");
        require(keccak256(abi.encode(_title)) != keccak256(abi.encode("")), "Title can not be empty");

        sessions = ++sessions;

        voteSessions[sessions].sessionAdmin = msg.sender;
        voteSessions[sessions].title = _title;
        voteSessions[sessions].voteType = _voteType;
               
        emit sessionCreated(sessions);
    }

    /** @notice Change vote session admin.
        @dev Only session admin can transfer adminship.
        @dev Session adminship can not be transfered to 0x0 or actual admin address.
        @param _address The new vote session admin address.
        @param _sessionID The vote session ID to  transfer.*/

    function transferSessionAdmin (address _address, uint64 _sessionID ) external validateSession(_sessionID) isSessionAdmin(_sessionID)  {
        require(_address != address(0), "New admin can't be the zero address");
        require(_address != voteSessions[_sessionID].sessionAdmin, "New admin can't be the actual admin");
        
        address oldAdmin = voteSessions[_sessionID].sessionAdmin;
        voteSessions[_sessionID].sessionAdmin = _address;

        emit sessionAdminTransferred(_sessionID, oldAdmin, _address);
    }


    /************** Voters **************/

    /** @notice Add voter to session whitelist.
        @dev Only session admin can add a voter.
        @param _address The voter address.
        @param _sessionID The vote session ID.*/

    function addVoter(address _address, uint64 _sessionID) external validateSession(_sessionID) isSessionAdmin(_sessionID) validateStatus(_sessionID,0) {
        require(!voters[_sessionID][_address].isRegistered, "This voter is already registered !");
        require((voteSessions[_sessionID].sessionVoters < maxVoterperSession), "Max voter per session reached");
        voters[_sessionID][_address].isRegistered = true;
        voteSessions[_sessionID].sessionVoters = ++voteSessions[_sessionID].sessionVoters;
        emit VoterRegistered(_address,_sessionID);
    }

    /** @notice Remove voter from session whitelist.
        @dev Only session admin can remove a voter.
        @param _address The voter address.
        @param _sessionID The vote session ID.*/

    function removeVoter (address _address,uint64 _sessionID) external validateSession(_sessionID) isSessionAdmin(_sessionID) validateStatus(_sessionID,0)  {
        require(voters[_sessionID][_address].isRegistered, "This voter is not registered !");
        delete voters[_sessionID][_address];
        voteSessions[_sessionID].sessionVoters = --voteSessions[_sessionID].sessionVoters;
        emit VoterUnregistered (_address,_sessionID);
    }

    /** @notice Set the max voters per Session .
        @dev Set state variable maxVoterperSession.
        @param _max The new max voter number.*/

    function setMaxVoterperSession (uint16 _max) public  onlyOwner {
        uint16 oldMaxVoter = maxVoterperSession;
        maxVoterperSession = _max;
        emit maxVoterperSessionModification(oldMaxVoter,_max);
    }


    /************** Change Session Status **************/

    /** @notice Change the workflowstatus of a session.
        @dev Only session admin can change workflowstatus.
        @param _sessionID The vote session ID.*/

    function changeWorkflowStatus (uint64 _sessionID) external validateSession(_sessionID) isSessionAdmin(_sessionID) {
        require((voteSessions[_sessionID].workflowStatus != WorkflowStatus.VotesTallied), "This Session is already finished !");

        WorkflowStatus previousStatus = voteSessions[_sessionID].workflowStatus;
        voteSessions[_sessionID].workflowStatus = WorkflowStatus(uint(voteSessions[_sessionID].workflowStatus) + 1);

        emit WorkflowStatusChange (previousStatus, voteSessions[_sessionID].workflowStatus,_sessionID);
    }


    /************** Proposals **************/

    /** @notice Get number of existing proposals for a session.
        @dev Restricted to internal usage.
        @param _sessionID The vote session ID.
        @return nbProposals The number of proposal in the session*/

    function getSessionCurrentProposalID (uint64 _sessionID) internal view returns (uint16 nbProposals) {
        uint8 i;
        uint16 currentID;  
        for (i=0;i< voteProposals.length;i++){
            if (voteProposals[i].voteSession ==_sessionID) { currentID = ++currentID; }
        }
        return currentID;
    }

    /** @notice Register a new  proposal to a vote session.
        @dev Only session voters can add a proposal.
        @param _decription The proposal description.
        @param _sessionID The vote session ID.*/

    function registerProposal (string calldata _decription, uint64 _sessionID) external validateSession(_sessionID) onlyVoters(_sessionID) validateStatus(_sessionID,1) {
        uint16 currentProposalID = getSessionCurrentProposalID (_sessionID);
        require((currentProposalID < maxProposalperSession), "Max proposal per session reached");
        require(keccak256(abi.encode(_decription)) != keccak256(abi.encode("")), "Description can not be empty");
       
        Proposal memory newProposal = Proposal (_decription,0,_sessionID);
        voteProposals.push(newProposal); 

        emit ProposalRegistered(currentProposalID+1,_sessionID);
    }

    /** @notice Set the max proposal per Session .
        @dev Set state variable maxVoterperSession.
        @param _max The new max voter number.*/       

    function setMaxProposalperSession (uint16 _max) public  onlyOwner {
        uint16 oldMaxProposal = maxProposalperSession;
        maxProposalperSession = _max;
        emit maxProposalperSessionModification(oldMaxProposal,_max);
    }



}
