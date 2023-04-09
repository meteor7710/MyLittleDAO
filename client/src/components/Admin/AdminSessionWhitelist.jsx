import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
import {
    Heading, Button, FormControl, FormLabel, Input, Text, Box, Alert, AlertIcon, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogContent, AlertDialogOverlay, useDisclosure, Flex, Spacer, Center,
    TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td
} from '@chakra-ui/react';


function AdminSessionWhitelist({ sessionSelected, addressToWhitelistLog, setAddressToWhitelistLog }) {

    const [addressToWhitelist, setAddressToWhitelist] = useState("");
    const [addressToRemove, setAddressToRemove] = useState("");
    const [registeredAddresses, setRegisteredAddresses] = useState();
    const [errorMsg, setErrorMsg] = useState("");
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure()

    //Manage address input
    const handleAddressChange = e => {
        setAddressToWhitelist(e.target.value);
    };

    //Manage address input
    const handleRemoveChange = e => {
        setAddressToRemove(e.target.value);
    };

    //Add address to whitelist
    const addAddressToWhitelist = async () => {
        if (!web3.utils.isAddress(addressToWhitelist)) { setErrorMsg("Address invalid"); onOpen(); setAddressToWhitelist(""); return; }

        //Validation address already submit
        const voterRegisteredEvents = await contract.getPastEvents('VoterRegistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
        const voterUnregisteredEvents = await contract.getPastEvents('VoterUnregistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });

        if (voterRegisteredEvents.length !== voterUnregisteredEvents.length) { setErrorMsg("Voter already whitelisted"); onOpen(); setAddressToWhitelist(""); return; }

        //Validation max voter not reach
        const maxVoterperSession = await contract.methods.maxVoterperSession().call({ from: accounts[0] });
        if ((voterRegisteredEvents.length - voterUnregisteredEvents.length) >= maxVoterperSession) { setErrorMsg("Max voter per session reached"); onOpen(); setAddressToWhitelist(""); return; }


        if (await contract.methods.addVoter(addressToWhitelist, sessionSelected).call({ from: accounts[0] })) {
            const addAddressTx = await contract.methods.addVoter(addressToWhitelist, sessionSelected).send({ from: accounts[0] });
            const addedAddressToWhitelist = addAddressTx.events.VoterRegistered.returnValues.voterAddress;
            setAddressToWhitelistLog("Address " + addedAddressToWhitelist + " added to the Whitelist");
            setAddressToWhitelist("");
        }
    };

    //Remove address from whitelist
    const removeAddressFromWhitelist = async () => {
        if (!web3.utils.isAddress(addressToRemove)) { setErrorMsg("Address invalid"); onOpen(); setAddressToRemove(""); return; }

        //Validation address already submit
        const voterRegisteredEvents = await contract.getPastEvents('VoterRegistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
        const voterUnregisteredEvents = await contract.getPastEvents('VoterUnregistered', { filter: { voterAddress: addressToWhitelist, sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });

        if (voterRegisteredEvents.length === voterUnregisteredEvents.length) { setErrorMsg("Voter not whitelisted"); onOpen(); setAddressToRemove(""); return; }

        if (await contract.methods.removeVoter(addressToRemove, sessionSelected).call({ from: accounts[0] })) {
            const addAddressTx = await contract.methods.removeVoter(addressToRemove, sessionSelected).send({ from: accounts[0] });
            const removedAddressToRemove = addAddressTx.events.VoterUnregistered.returnValues.voterAddress;
            setAddressToWhitelistLog("Address " + removedAddressToRemove + " removed from the Whitelist");
            setAddressToRemove("");
        }
    };

    //Build table of  whitelisted addresses
    useEffect(() => {
        (async function () {
            const voterRegisteredEvents = await contract.getPastEvents('VoterRegistered', { filter: { sessionID: sessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
            const voterAddresses = [];

            let pos;

            for (let i = (voterRegisteredEvents.length-1); i >= 0; i--) {

                const voterAddedEvents = await contract.getPastEvents('VoterRegistered', { filter: { sessionID: sessionSelected, voterAddress: voterRegisteredEvents[i].returnValues.voterAddress }, fromBlock: creationBlock, toBlock: 'latest' });
                const voterRemovedEvents = await contract.getPastEvents('VoterUnregistered', { filter: { sessionID: sessionSelected, voterAddress: voterRegisteredEvents[i].returnValues.voterAddress }, fromBlock: creationBlock, toBlock: 'latest' });

                if (voterAddedEvents.length > voterRemovedEvents.length) {

                    pos = voterAddresses.map(e => e.voterAddress).indexOf(voterRegisteredEvents[i].returnValues.voterAddress);

                    if (pos === -1) {
                        voterAddresses.push(
                            {
                                blockNumber: voterRegisteredEvents[i].blockNumber,
                                voterAddress: voterRegisteredEvents[i].returnValues.voterAddress,
                            });
                    }
                }
            };

            //Build table body of registered address
            const listAdresses = voterAddresses.map((add, index) =>
                <Tr key={"add" + index}>
                    <Td>{add.blockNumber}</Td>
                    <Td>{add.voterAddress}</Td>
                </Tr>
            );

            setRegisteredAddresses(listAdresses);
        })();
    }, [contract, accounts, creationBlock, sessionSelected, addressToWhitelistLog])

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
                            <Input width='400px' type='text' placeholder="Voter address" onChange={handleAddressChange} value={addressToWhitelist} autoComplete="off" />
                            <Spacer />
                            <Button colorScheme='gray' onClick={addAddressToWhitelist}>Add Voter</Button>
                            <Spacer />
                        </Flex>
                    </FormControl>
                </Box>
                <Box m="25px" >
                    <FormControl >
                        <Flex>
                            <Spacer />
                            <Center>
                                <FormLabel>Remove from whitelist :</FormLabel>
                            </Center>
                            <Spacer />
                            <Input width='400px' type='text' placeholder="Voter address" onChange={handleRemoveChange} value={addressToRemove} autoComplete="off" />
                            <Spacer />
                            <Button colorScheme='gray' onClick={removeAddressFromWhitelist}>Remove Voter</Button>
                            <Spacer />
                        </Flex>
                    </FormControl>
                </Box>
                <Box>
                    {(addressToWhitelistLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {addressToWhitelistLog} </Alert>) :
                        <Text></Text>}
                </Box>
                <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Whitelisted adresses</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Registration Block Number</Th>
                                <Th>Address</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{registeredAddresses}</Tbody>
                    </Table>
                </TableContainer>
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

export default AdminSessionWhitelist;
