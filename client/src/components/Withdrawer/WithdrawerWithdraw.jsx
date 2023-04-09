import { useState, useEffect } from "react";
import { useEth } from "../../contexts/EthContext";
import { Heading, Button, Text, Box, Alert, AlertIcon, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogContent, AlertDialogOverlay, useDisclosure, Table,TableContainer,TableCaption,
 Thead,Tr,Th,Tbody, Td} from '@chakra-ui/react';

function WithdrawerWithdraw({ withdrawerSessionSelected, withdrawLog, setWithdrawLog }) {
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [errorMsg, setErrorMsg] = useState("");
    const [registeredWithdrawals, setRegisteredWithdrawals] = useState();

    //Withdraw session
    const withdrawSession = async () => {

        //Validate session is not already withdrawed
        const withdrawEvents = await contract.getPastEvents('WithdrawalSubmitted', { filter: { sessionID: withdrawerSessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });
        if (withdrawEvents.length > 0) { setErrorMsg("You have already withdraw this session"); onOpen(); return; }

        if (await contract.methods.sessionWithdraw(withdrawerSessionSelected).call({ from: accounts[0] })) {
            const withdrawTx = await contract.methods.sessionWithdraw(withdrawerSessionSelected).send({ from: accounts[0] });
            const withdrawAmount = withdrawTx.events.WithdrawalSubmitted.returnValues.amount;

            setWithdrawLog(web3.utils.fromWei(withdrawAmount, 'ether') + " ETH have been withdrawed");
        }
    }

    //show withdraw history
    useEffect(() => {
        (async function () {
            const withdrawEvents = await contract.getPastEvents('WithdrawalSubmitted', {filter: {sessionID: withdrawerSessionSelected }, fromBlock: creationBlock, toBlock: 'latest' });

            const whitdrawals = [];

            for (let i = 0; i < withdrawEvents.length; i++) {
                whitdrawals.push(
                    {
                        blockNumber: withdrawEvents[i].blockNumber,
                        amount: web3.utils.fromWei(withdrawEvents[i].returnValues.amount, 'ether'),
                        withdrawer: withdrawEvents[i].returnValues.withdrawer
                    });
            };

            //Build table body of registered address
            const listWithdrawals = whitdrawals.map((withdraw, index) =>
                <Tr key={"withdraw" + index}>
                    <Td>{withdraw.blockNumber}</Td>
                    <Td>{withdraw.amount}</Td>
                    <Td>{withdraw.withdrawer}</Td>
                </Tr>
            );

            setRegisteredWithdrawals(listWithdrawals);
        })();
    }, [contract, accounts,withdrawerSessionSelected, creationBlock, setWithdrawLog ,web3])



    return (
        <section className="votes">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Withdraw</Heading>
                <Box m="25px" >
                    <Button colorScheme='gray' onClick={withdrawSession}>Withdraw donations</Button>
                </Box>
                <Box>
                    {(withdrawLog !== "") ? (<Alert width="auto" status='success' borderRadius='25px'> <AlertIcon /> {withdrawLog} </Alert>) :
                        <Text></Text>}
                </Box>
                <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                    <Table>
                        <TableCaption>Withdrawals</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>Block Number</Th>
                                <Th>Amount (ETH)</Th>
                                <Th>Withdrawer</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{registeredWithdrawals}</Tbody>
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

export default WithdrawerWithdraw;
