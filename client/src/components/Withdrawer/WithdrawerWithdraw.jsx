import { useState } from "react";
import { useEth } from "../../contexts/EthContext";
import { Heading, Button, Text, Box, Alert, AlertIcon, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogContent, AlertDialogOverlay, useDisclosure } from '@chakra-ui/react';

function WithdrawerWithdraw({ withdrawerSessionSelected, withdrawLog, setWithdrawLog }) {
    const { state: { contract, accounts, web3, creationBlock } } = useEth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [errorMsg, setErrorMsg] = useState("");

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
