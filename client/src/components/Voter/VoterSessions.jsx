import { Box, Heading, FormControl, FormLabel, Select, Alert, AlertIcon, Text } from '@chakra-ui/react';
import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterSessions() {

    const { state: { contract, accounts, creationBlock, networkID } } = useEth();
    const [voterSessionList, setVoterSessionList] = useState([]);
    const [voterSessionSelected, setVoterSessionSelected] = useState("");

    //Manage Session selected
    const handleSelectedSession = e => {
        setVoterSessionSelected(e.target.value);
    };

    //show session create where user is voter
    useEffect(() => {
        (async function () {

            //Get Session information from a Session ID
            async function getSessionlInformations(sessionID) {
                let session = [];
                session = await contract.methods.getSession(parseInt(sessionID)).call({ from: accounts[0] });
                return session;
            };

            //Create Session admin list from events
            const sessionsEvents = await contract.getPastEvents("VoterRegistered", { filter: { voterAddress: accounts[0] }, fromBlock: creationBlock, toBlock: "latest" });

            let voterSessions = [];

            for (let i = 0; i < sessionsEvents.length; i++) {

                /*//validate adminship has not been transferred to another
                let sessionAdmin = sessionsEvents[i].returnValues.adminAddress

                //Create Session admin transfer list from events and apply last admin
                const sessionsTransferredEvents = await contract.getPastEvents("sessionAdminTransferred", { filter: { sessionID: sessionsEvents[i].returnValues.sessionID }, fromBlock: creationBlock, toBlock: "latest" });
                if (sessionsTransferredEvents.length > 0) {
                    sessionAdmin = sessionsTransferredEvents[sessionsTransferredEvents.length - 1].returnValues.newAdmin;
                }*/


                //if (sessionAdmin === accounts[0]) {

                    let session = await getSessionlInformations(sessionsEvents[i].returnValues.sessionID);
                    voterSessions.push(
                        {
                            id: sessionsEvents[i].returnValues.sessionID,
                            title: session.title,
                        });
                //}
            }

            //Manage admin list selection
            const voterSessionsRendered = voterSessions.map((session, index) =>
                <option key={"session" + index} value={session.id}>Session {session.id} - {session.title}</option>
            );

            setVoterSessionList(voterSessionsRendered);
        })();
    }, [contract, accounts, networkID, creationBlock ])





    return (
        <section className="VoterSessions">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Voter role Session List</Heading>
                <Box m="25px" >
                    <FormControl >
                        <FormLabel my="5px">Select Voter Session</FormLabel>
                        <Select my="5px" placeholder="Voter Sessions" onChange={handleSelectedSession} value={voterSessionSelected}>
                            {voterSessionList}
                        </Select>
                    </FormControl>
                </Box>
            </Box>
        </section>
    );
}

export default VoterSessions;
