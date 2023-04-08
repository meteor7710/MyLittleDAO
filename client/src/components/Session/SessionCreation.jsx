import { Heading, Box, FormLabel, FormControl, Text, Button, Input, Select, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogBody, Alert, AlertIcon, AlertDialogFooter } from "@chakra-ui/react";
import { useState,useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function SessionCreation() {
    const { state: { contract, accounts } } = useEth();
    const [sessionTitle, setSessionTitle] = useState("");
    const [sessionVoteType, setSessionVoteType] = useState("");
    const [sessionVoteTypeLog, setSessionVoteTypeLog] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const { isOpen, onOpen, onClose } = useDisclosure();


    useEffect(() => {
        (async function () {
            setSessionVoteTypeLog("");

        })();
      }, [accounts])


    //Manage Title input
    const handleTitleChange = e => {
        setSessionTitle(e.target.value);
    };

    //Manage VoteType input
    const handleVoteTypeChange = e => {
        setSessionVoteType(e.target.value);
    };

    //Create a new session
    const createNewSession = async () => {

        let sessionVoteTypeInt;

        if (sessionTitle === "") { setErrorMsg("Session title can't be null"); onOpen(); return; }
        if (sessionVoteType === "") { setErrorMsg("Session vote type can't be null"); onOpen(); return; }

        switch (sessionVoteType) {
            case "Simple Vote":
                sessionVoteTypeInt = 0;
                break;
            case "Pot Vote":
                sessionVoteTypeInt = 1;
                break;
            case "Admin Vote":
                sessionVoteTypeInt = 2;
                break;
            default:
        }

        if (await contract.methods.createnewVoteSession(sessionTitle, sessionVoteTypeInt).call({ from: accounts[0] })) {
            const addSessionTx = await contract.methods.createnewVoteSession(sessionTitle, sessionVoteTypeInt).send({ from: accounts[0] });
            const addedAddressToWhitelist = addSessionTx.events.sessionCreated.returnValues.sessionID;
            setSessionVoteTypeLog("Session " + addedAddressToWhitelist + " " + sessionTitle + " created");
        }

        setSessionTitle("");
        setSessionVoteType("");
    };

    return (
        <section className="sessionCreation">
            <Box my="10px" p="25px" border="1px" borderRadius="25px" borderColor="gray.200">
                <Heading as="h3" size="lg">Session Creation</Heading>
                <Box m="25px" >
                    <FormControl >
                        <FormLabel my="5px">Create new vote session :</FormLabel>
                        <Input my="5px" type="text" placeholder="Session Title" onChange={handleTitleChange} value={sessionTitle} autoComplete="off" />
                        <Select my="5px" maxW="200px" placeholder="Vote Type" onChange={handleVoteTypeChange} value={sessionVoteType}>
                            <option>Simple Vote</option>
                            <option>Pot Vote</option>
                            <option>Admin Vote</option>
                        </Select>
                        <Button my="5px" colorScheme="gray" onClick={createNewSession}>Create session</Button>
                    </FormControl>
                </Box>
                <Box>
                    {(sessionVoteTypeLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {sessionVoteTypeLog} </Alert>) :
                        <Text></Text>}
                </Box>
            </Box>
            <AlertDialog isOpen={isOpen} onClose={onClose} >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogBody>
                            <Alert width="auto" status="error" borderRadius="25px"> <AlertIcon />{errorMsg}</Alert>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onClose}>Close</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </section>
    );
}

export default SessionCreation;