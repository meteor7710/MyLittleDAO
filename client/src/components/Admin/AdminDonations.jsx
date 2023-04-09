import { Box, Heading, TableContainer, Table, TableCaption,Thead,Tr,Th,Tbody,Td } from '@chakra-ui/react';
    import { useState, useEffect } from "react";
    import useEth from "../../contexts/EthContext/useEth";
    
    function AdminDonations({ sessionSelected,amountToDonateLog }) {
    
        const [registeredDonations, setregisteredDonations] = useState();
        const { state: { contract, accounts, web3, creationBlock } } = useEth();
    
        //show voter donations history
        useEffect(() => {
            (async function () {
                const donationsEvents = await contract.getPastEvents('DonationRegistered', {filter: {sessionID: sessionSelected  }, fromBlock: creationBlock, toBlock: 'latest' });
    
                const donations = [];
    
                for (let i = 0; i < donationsEvents.length; i++) {
                    donations.push(
                        {
                            blockNumber: donationsEvents[i].blockNumber,
                            donator: donationsEvents[i].returnValues.addr,
                            amount: web3.utils.fromWei(donationsEvents[i].returnValues.amount, 'ether')
                            
                        });
                };
    
                //Build table body of registered address
                const listDonations = donations.map((donation, index) =>
                    <Tr key={"donation" + index}>
                        <Td>{donation.blockNumber}</Td>
                        <Td>{donation.donator}</Td>
                        <Td>{donation.amount}</Td>
                    </Tr>
                );
    
                setregisteredDonations(listDonations);
            })();
        }, [contract, accounts,sessionSelected, creationBlock, amountToDonateLog,web3])
    
    
        return (
            <section className="AdminDonations">
                <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                    <Heading as='h3' size='lg'>Session Donations</Heading>
                    
                    <TableContainer my="10px" maxHeight="380px" overflowY="auto">
                        <Table>
                            <TableCaption>Voters Donations</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Registration Block</Th>
                                    <Th>Donators</Th>
                                    <Th>Donations (ETH)</Th>
                                </Tr>
                            </Thead>
                            <Tbody>{registeredDonations}</Tbody>
                        </Table>
                    </TableContainer>
                </Box>
            </section>
        );
    }
    
    export default AdminDonations;
    