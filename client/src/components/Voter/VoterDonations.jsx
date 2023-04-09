import { useDisclosure, Text, Box, Heading, FormLabel, Spacer, Input, Button, FormControl, Flex, Center, Alert, AlertDialog, AlertDialogOverlay, AlertIcon, AlertDialogContent, AlertDialogBody, AlertDialogFooter,
TableContainer, Table, TableCaption,Thead,Tr,Th,Tbody,Td } from '@chakra-ui/react';
import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";

function VoterDonations({ voterSessionSelected,amountToDonateLog,setAmountToDonateLog }) {

    const [amountToDonate, setAmountToDonate] = useState("");
    const [registeredDonations, setregisteredDonations] = useState();
    const [errorMsg, setErrorMsg] = useState("");
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure()


    //Manage address input
    const handleAmountChange = e => {
        setAmountToDonate(e.target.value);
    };

    //Send donation
    const sendDonation = async () => {

        if (amountToDonate === "0") { setErrorMsg("Donation can not be 0"); onOpen(); setAmountToDonate(""); return; }

        const session = await contract.methods.getSession(voterSessionSelected).call({ from: accounts[0] });
        if (session.workflowStatus === "0" || session.workflowStatus === "4" || session.workflowStatus === "5") { setErrorMsg("You can't donate at this status"); onOpen(); setAmountToDonate(""); return; }

        const weiAmount = web3.utils.toWei(amountToDonate, 'ether');

        if (await contract.methods.sendDonation(voterSessionSelected).call({ from: accounts[0], value: weiAmount })) {
            const donationTx = await contract.methods.sendDonation(voterSessionSelected).send({ from: accounts[0], value: weiAmount });
            const donationAmount = donationTx.events.DonationRegistered.returnValues.amount;
            const donationAmountEth = web3.utils.fromWei(donationAmount, 'ether');
            setAmountToDonateLog(donationAmountEth + " ETH donated");
            setAmountToDonate("");
        }
    };

    //show voter donations history
    useEffect(() => {
        (async function () {
            const donationsEvents = await contract.getPastEvents('DonationRegistered', {filter: {sessionID: voterSessionSelected, addr: accounts[0]  }, fromBlock: creationBlock, toBlock: 'latest' });

            const donations = [];

            for (let i = 0; i < donationsEvents.length; i++) {
                donations.push(
                    {
                        blockNumber: donationsEvents[i].blockNumber,
                        amount: web3.utils.fromWei(donationsEvents[i].returnValues.amount, 'ether')
                        
                    });
            };

            //Build table body of registered address
            const listDonations = donations.map((donation, index) =>
                <Tr key={"donation" + index}>
                    <Td>{donation.blockNumber}</Td>
                    <Td>{donation.amount}</Td>
                </Tr>
            );

            setregisteredDonations(listDonations);
        })();
    }, [contract, accounts,voterSessionSelected, creationBlock, amountToDonateLog,web3])


    return (
        <section className="VoterDonations">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Voter Donations</Heading>
                <Box m="25px" >
                    <FormControl >
                        <Flex>
                            <Spacer />
                            <Center>
                                <FormLabel>Donate :</FormLabel>
                            </Center>
                            <Spacer />
                            <Input width='400px' type='number' placeholder="Donation amount in eth" onChange={handleAmountChange} value={amountToDonate} autoComplete="off" />
                            <Spacer />
                            <Button colorScheme='gray' onClick={sendDonation}>Send Donation</Button>
                            <Spacer />
                        </Flex>
                    </FormControl>
                </Box>
                <Box>
                    {(amountToDonateLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {amountToDonateLog} </Alert>) :
                        <Text></Text>}
                </Box>
                <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Voter Donations</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Registration Block Number</Th>
                                <Th>Donations (ETH)</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{registeredDonations}</Tbody>
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

export default VoterDonations;
