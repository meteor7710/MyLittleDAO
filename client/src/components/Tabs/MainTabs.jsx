import { Box, Tabs, TabList, Tab, TabPanels,TabPanel } from '@chakra-ui/react';
import SessionCreation from "../Session/SessionCreation"
import AdminSession from '../Session/AdminSession';

function MainTabs() {
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
                        <AdminSession />
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