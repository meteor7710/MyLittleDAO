import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSession from '../Session/AdminSessions';
import AdminSessionInformations from '../Session/AdminSessionInformations';
import AdminSessionStatus from '../Session/AdminSessionStatus';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function MainTabs() {

    const [sessionSelected, setSessionSelected] = useState("");
    const { state: { contract, accounts, networkID } } = useEth();

    //Initialize variables 
    useEffect(() => {
        (async function () {
            setSessionSelected("");
        })();
    }, [contract, accounts,networkID ])


    const status =
        <>
            <AdminSessionInformations sessionSelected={sessionSelected} />
            <AdminSessionStatus sessionSelected={sessionSelected} />
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
                        <SessionCreation />
                    </TabPanel>
                    <TabPanel>
                        <AdminSession sessionSelected={sessionSelected} setSessionSelected={setSessionSelected} />
                        {(sessionSelected !== "") ? (status) :
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