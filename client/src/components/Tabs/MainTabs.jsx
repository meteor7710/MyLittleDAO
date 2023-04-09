import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSessions from '../Admin/AdminSessions';
import AdminSessionInformations from '../Admin/AdminSessionInformations';
import AdminSessionStatus from '../Admin/AdminSessionStatus';
import AdminSessionWhitelist from '../Admin/AdminSessionWhitelist';
import AdminSessionTransfer from '../Admin/AdminSessionTransfer';
import VoterSessions from '../Voter/VoterSessions';
import VoterSessionInformations from '../Voter/VoterSessionInformations';
import VoterDonations from '../Voter/VoterDonations';
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
    //const [adminSessionType, setAdminSessionType] = useState("0");

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
            setWorkflowStatusLog("");
            setAddressToWhitelistLog("");
            setNewAdminAddressLog("")
        })();
    }, [sessionSelected])

    //Initialize VoterTab 
    useEffect(() => {
        (async function () {
            if (voterSessionSelected !== "") {
                const session = await contract.methods.getSession((voterSessionSelected)).call({ from: accounts[0] });
                setVoterSessionType(session.voteType)
            }
            setAmountToDonateLog("")
        })();
    }, [voterSessionSelected, accounts, contract])


    const admin =
        <>
            <AdminSessionInformations sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} workflowStatusLog={workflowStatusLog} />
            <AdminSessionWhitelist sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} setAddressToWhitelistLog={setAddressToWhitelistLog} />
            <AdminSessionStatus sessionSelected={sessionSelected} workflowStatusLog={workflowStatusLog} setWorkflowStatusLog={setWorkflowStatusLog} />
            <AdminSessionTransfer sessionSelected={sessionSelected} setNewAdminAddressLog={setNewAdminAddressLog} setSessionSelected={setSessionSelected} />
        </>;

    const voter =
        <>
            <VoterSessionInformations voterSessionSelected={voterSessionSelected} addressToWhitelistLog={addressToWhitelistLog} workflowStatusLog={workflowStatusLog} />
            {(voterSessionType === "1") ? <VoterDonations voterSessionSelected={voterSessionSelected} amountToDonateLog={amountToDonateLog} setAmountToDonateLog={setAmountToDonateLog} /> :
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
                        <VoterSessions voterSessionSelected={voterSessionSelected} setVoterSessionSelected={setVoterSessionSelected} sessionCreationLog={sessionCreationLog} />
                        {(voterSessionSelected !== "") ? (voter) :
                            <Text></Text>}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default MainTabs;