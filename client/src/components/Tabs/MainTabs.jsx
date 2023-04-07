import { Box, Tabs, TabList, Tab, TabPanels,TabPanel } from '@chakra-ui/react';
import Session from "../Session/SessionCreation"

function MainTabs() {
    return (
        <Box >
            <Tabs variant='line'>
                <TabList>
                    <Tab>Create new Sessions</Tab>
                    <Tab>Admin Sessions</Tab>
                    <Tab>Vote Sessions</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <Session />
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
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