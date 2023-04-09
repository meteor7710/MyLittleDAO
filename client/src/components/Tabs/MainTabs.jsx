import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSessions from '../Admin/AdminSessions';
import AdminSessionInformations from '../Admin/AdminSessionInformations';
import AdminSessionStatus from '../Admin/AdminSessionStatus';
import AdminSessionWhitelist from '../Admin/AdminSessionWhitelist';
import AdminProposals from '../Admin/AdminProposals';
import AdminSessionTransfer from '../Admin/AdminSessionTransfer';
import AdminDonations from '../Admin/AdminDonations';
import VoterSessions from '../Voter/VoterSessions';
import VoterSessionInformations from '../Voter/VoterSessionInformations';
import VoterDonations from '../Voter/VoterDonations';
import VoterProposals from '../Voter/VoterProposals';
import VoterVotes from '../Voter/VoterVotes';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function MainTabs() {

    const [sessionSelected, setSessionSelected] = useState("");
    const [addressToWhitelistLog, setAddressToWhitelistLog] = useState("");
    const [workflowStatusLog, setWorkflowStatusLog] = useState("");
    const [sessionCreationLog, setSessionCreationLog] = useState("");
    const [newAdminAddressLog, setNewAdminAddressLog] = useState("");
    const [amountToDonateLog, setAmountToDonateLog] = useState("");
    const [voterSessionSelected, setVoterSessionSelected] = useState("");
    const [voterSessionType, setVoterSessionType] = useState("");
    const [voterSessionStatus, setVoterSessionStatus] = useState("");
    const [adminSessionType, setAdminSessionType] = useState("");
    const [addProposalLog, setAddProposalLog] = useState("");

    const { state: { contract, accounts, networkID } } = useEth();

    //Initialize variables 
    useEffect(() => {
        (async function () {
            setSessionSelected("");
            setVoterSessionSelected("");
        })();
    }, [contract, accounts, networkID])

    //Initialize AdminTab 
    useEffect(() => {
        (async function () {
            if (sessionSelected !== "") {
                const session = await contract.methods.getSession((sessionSelected)).call({ from: accounts[0] });
                setAdminSessionType(session.voteType);
            }
            setWorkflowStatusLog("");
            setAddressToWhitelistLog("");
            setNewAdminAddressLog("");
        })();
    }, [sessionSelected,accounts, contract,workflowStatusLog])

    //Initialize VoterTab 
    useEffect(() => {
        (async function () {
            if (voterSessionSelected !== "") {
                const session = await contract.methods.getSession((voterSessionSelected)).call({ from: accounts[0] });
                setVoterSessionType(session.voteType);
                setVoterSessionStatus(session.workflowStatus);
            }
            setAmountToDonateLog("");
            setAddProposalLog("");
        })();
    }, [voterSessionSelected, accounts, contract,workflowStatusLog])


    const admin =
        <>
            <AdminSessionInformations sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} workflowStatusLog={workflowStatusLog} />
            <AdminSessionWhitelist sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} setAddressToWhitelistLog={setAddressToWhitelistLog} />
            <AdminSessionStatus sessionSelected={sessionSelected} workflowStatusLog={workflowStatusLog} setWorkflowStatusLog={setWorkflowStatusLog} />
            {(adminSessionType === "1") ? <AdminDonations sessionSelected={sessionSelected} amountToDonateLog={amountToDonateLog}/> :
                <Text></Text>}
            <AdminProposals sessionSelected={sessionSelected} addProposalLog={addProposalLog}/>
            <AdminSessionTransfer sessionSelected={sessionSelected} setNewAdminAddressLog={setNewAdminAddressLog} setSessionSelected={setSessionSelected} />
        </>;

    const voter =
        <>
            <VoterSessionInformations voterSessionSelected={voterSessionSelected} addressToWhitelistLog={addressToWhitelistLog} workflowStatusLog={workflowStatusLog} />
            {(voterSessionType === "1") ? <VoterDonations voterSessionSelected={voterSessionSelected} amountToDonateLog={amountToDonateLog} setAmountToDonateLog={setAmountToDonateLog} /> :
                <Text></Text>}
            {(voterSessionStatus >= "1") ? <VoterProposals voterSessionSelected={voterSessionSelected} addProposalLog={addProposalLog} setAddProposalLog={setAddProposalLog} voterSessionStatus={voterSessionStatus} voterSessionType={voterSessionType}/> :
                <Text></Text>}
            {(voterSessionStatus === "3") ? <VoterVotes voterSessionSelected={voterSessionSelected} voterSessionType={voterSessionType} /> :
             <Text></Text>}
        </>;
    

    return (
        <Box >
            <Tabs variant='line'>
                <TabList>
                    <Tab>Create new Sessions</Tab>
                    <Tab>Admin role Sessions</Tab>
                    <Tab>Vote role Sessions</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <SessionCreation sessionCreationLog={sessionCreationLog} setSessionCreationLog={setSessionCreationLog} />
                    </TabPanel>
                    <TabPanel>
                        <AdminSessions sessionSelected={sessionSelected} setSessionSelected={setSessionSelected} sessionCreationLog={sessionCreationLog} newAdminAddressLog={newAdminAddressLog} setNewAdminAddressLog={setNewAdminAddressLog} />
                        {(sessionSelected !== "") ? (admin) :
                            <Text></Text>}
                    </TabPanel>
                    <TabPanel>
                        <VoterSessions voterSessionSelected={voterSessionSelected} setVoterSessionSelected={setVoterSessionSelected} addressToWhitelistLog={addressToWhitelistLog} />
                        {(voterSessionSelected !== "") ? (voter) :
                            <Text></Text>}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default MainTabs;