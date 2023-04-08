import { Box, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSession from '../Session/AdminSessions';
import AdminSessionInformations from '../Session/AdminSessionInformations';
import { useState } from "react";

function MainTabs() {

    const [sessionSelected, setSessionSelected] = useState("");


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
                        {(sessionSelected !== "") ? (<AdminSessionInformations sessionSelected={sessionSelected} />) :
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