import { Box, Heading, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterSessions({voterSessionSelected,setVoterSessionSelected,addressToWhitelistLog}) {

    const { state: { contract, accounts, creationBlock, networkID } } = useEth();
    const [voterSessionList, setVoterSessionList] = useState([]);
   

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
            let pos;

            for (let i = 0; i < sessionsEvents.length; i++) {

                const voterAddedEvents = await contract.getPastEvents('VoterRegistered', { filter: { sessionID: sessionsEvents[i].returnValues.sessionID, voterAddress: accounts[0] }, fromBlock: creationBlock, toBlock: 'latest' });
                const voterRemovedEvents = await contract.getPastEvents('VoterUnregistered', { filter: { sessionID: sessionsEvents[i].returnValues.sessionID, voterAddress: accounts[0] }, fromBlock: creationBlock, toBlock: 'latest' });

                if (voterAddedEvents.length > voterRemovedEvents.length) {

                    pos = voterSessions.map(e => e.id).indexOf(sessionsEvents[i].returnValues.sessionID);

                    if (pos === -1) {

                        let session = await getSessionlInformations(sessionsEvents[i].returnValues.sessionID);
                        voterSessions.push(
                            {
                                id: sessionsEvents[i].returnValues.sessionID,
                                title: session.title,
                            });
                    }
                }
            }

            //Manage voter list selection
            const voterSessionsRendered = voterSessions.map((session, index) =>
                <option key={"session" + index} value={session.id}>Session {session.id} - {session.title}</option>
            );

            setVoterSessionList(voterSessionsRendered);
        })();
    }, [contract, accounts, networkID, creationBlock,addressToWhitelistLog])





    return (
        <section className="VoterSessions">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Voter role Session List</Heading>
                <Box m="25px" >
                    <FormControl >
                        <FormLabel my="5px">Select Session</FormLabel>
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
