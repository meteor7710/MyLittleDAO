import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSession from '../Admin/AdminSessions';
import AdminSessionInformations from '../Admin/AdminSessionInformations';
import AdminSessionStatus from '../Admin/AdminSessionStatus';
import AdminSessionWhitelist from '../Admin/AdminSessionWhitelist';
import AdminSessionTransfer from '../Admin/AdminSessionTransfer';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
function MainTabs() {

    const [sessionSelected, setSessionSelected] = useState("");
    const [addressToWhitelistLog, setAddressToWhitelistLog] = useState("");
    const [workflowStatusLog, setWorkflowStatusLog] = useState("");
    const [sessionCreationLog, setSessionCreationLog] = useState("");
    const [newAdminAddressLog, setNewAdminAddressLog] = useState("");
    const { state: { contract, accounts, networkID } } = useEth();

    //Initialize variables 
    useEffect(() => {
        (async function () {
            setSessionSelected("");
        })();
    }, [contract, accounts,networkID ])

    //Initialize logs 
    useEffect(() => {
        (async function () {
            setWorkflowStatusLog("");
            setAddressToWhitelistLog("");
        })();
    }, [sessionSelected ])


    const admin =
        <>
            <AdminSessionInformations sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} workflowStatusLog={workflowStatusLog}/>
            <AdminSessionWhitelist sessionSelected={sessionSelected} addressToWhitelistLog={addressToWhitelistLog} setAddressToWhitelistLog={setAddressToWhitelistLog} />
            <AdminSessionStatus sessionSelected={sessionSelected} workflowStatusLog={workflowStatusLog} setWorkflowStatusLog={setWorkflowStatusLog} />
            <AdminSessionTransfer sessionSelected={sessionSelected} setNewAdminAddressLog={setNewAdminAddressLog} setSessionSelected={setSessionSelected} />
        </>


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
                        <AdminSession sessionSelected={sessionSelected} setSessionSelected={setSessionSelected} sessionCreationLog={sessionCreationLog} newAdminAddressLog={newAdminAddressLog} setNewAdminAddressLog={setNewAdminAddressLog}/>
                        {(sessionSelected !== "") ? (admin) :
                            <Text></Text>}

                    </TabPanel>
                    <TabPanel>
                        <p>three!</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}

export default MainTabs;