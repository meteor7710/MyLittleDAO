import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { Heading, Button, FormControl, FormLabel, Input, Text, Box, Alert, AlertIcon, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogContent, AlertDialogOverlay, useDisclosure, Flex, Spacer, Center } from '@chakra-ui/react';


function SessionWhitelist({ sessionSelected }) {

    const [addressToWhitelist, setAddressToWhitelist] = useState("");
    const [addressToWhitelistLog, setAddressToWhitelistLog] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure()

    //Manage address input
    const handleAdressChange = e => {
        setAddressToWhitelist(e.target.value);
    };

    //Add address to whitelist
    const addAddressToWhitelist = async () => {
        if (!web3.utils.isAddress(addressToWhitelist)) { setErrorMsg("Address invalid"); onOpen(); return; }

        const voterRegisteredEvents = await contract.getPastEvents('VoterRegistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected },fromBlock: creationBlock, toBlock: 'latest' });
        const voterUnregisteredEvents = await contract.getPastEvents('VoterUnregistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected },fromBlock: creationBlock, toBlock: 'latest' });

        if (voterRegisteredEvents.length !== voterUnregisteredEvents.length) { setErrorMsg("Voter already whitelisted"); onOpen(); setAddressToWhitelist("");return; }

        if (await contract.methods.addVoter(addressToWhitelist, sessionSelected).call({ from: accounts[0] })) {
            const addAddressTx = await contract.methods.addVoter(addressToWhitelist, sessionSelected).send({ from: accounts[0] });
            const addedAddressToWhitelist = addAddressTx.events.VoterRegistered.returnValues.voterAddress;
            setAddressToWhitelistLog("Address " + addedAddressToWhitelist + " added to the Whitelist");
            setAddressToWhitelist("");
        }
    };

    return (
        <section className="sessionWhitelist">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Session Whitelist Registration</Heading>
                <Box m="25px" >
                    <FormControl >
                        <Flex>
                            <Spacer />
                            <Center>
                                <FormLabel>Add to whitelist :</FormLabel>
                            </Center>
                            <Spacer />
                            <Input width='400px' type='text' placeholder="Voter address" onChange={handleAdressChange} value={addressToWhitelist} autoComplete="off" />
                            <Spacer />
                            <Button colorScheme='gray' onClick={addAddressToWhitelist}>Add Voter</Button>
                            <Spacer />
                        </Flex>
                    </FormControl>
                </Box>
                <Box>
                    {(addressToWhitelistLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {addressToWhitelistLog} </Alert>) :
                        <Text></Text>}
                </Box>
            </Box>
            <AlertDialog isOpen={isOpen} onClose={onClose} >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogBody>
                            <Alert width="auto" status='error' borderRadius='25px'> <AlertIcon />{errorMsg}</Alert>
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

export default SessionWhitelist;
