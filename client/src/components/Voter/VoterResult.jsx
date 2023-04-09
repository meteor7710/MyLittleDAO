import { TableContainer, Tbody, Thead, Table, TableCaption, Tr, Th, Td, Box,Heading } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useEth } from "../../contexts/EthContext";

function VoterResult({ voterSessionSelected ,voterSessionStatus}) {
    const { state: { accounts, contract } } = useEth();
    const [result, setResult] = useState();

    useEffect(() => {
        async function getResult() {

            if (voterSessionStatus === "5") {
                const winnerId = await contract.methods.getWinningProposal(voterSessionSelected).call({ from: accounts[0] });
                const winnerProposal = await contract.methods.getProposal(winnerId, voterSessionSelected).call({ from: accounts[0] });
                const winnerDesc = winnerProposal.description;

                const proposalRendered = (
                    <TableContainer>
                        <Table>
                            <TableCaption>Wining Proposal</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Wining Proposal ID</Th>
                                    <Th>Wining Proposal description</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr key={"winner"} >
                                    <Td>{winnerId}</Td>
                                    <Td>{winnerDesc}</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                );
                setResult(proposalRendered);
            }
        }

        getResult();
    }, [accounts, contract, voterSessionSelected,voterSessionStatus]);

    return (
        <section className="result">
            <Box my="10px" p="25px" border='1px' borderRadius='25px' borderColor='gray.200'>
                <Heading as='h3' size='lg'>Result</Heading>
                <Box>{result}</Box> :
            </Box>
        </section>
    );
}

export default VoterResult;
