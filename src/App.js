import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Button,
  HStack,
  Input,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Alert,
  useToast,
} from '@chakra-ui/react';
import {
  connect,
  isMetaMaskInstalled,
  getProvider,
  getSigner,
} from './connection/metamask';
import { formatEther, Contract } from 'ethers';
import TeamLead from './abi/teamlead.json';

function App() {
  const [account, setAccount] = useState("");
  const [myBalance, setMyBalance] = useState("");
  const [TeamLeadName, setTeamLeadName] = useState("");
  const [newTeamLead, setNewTeamLead] = useState("");
  const [chainError, setChainError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (account) {
      getBalance(account);
      setChainError(null);
    }
    console.log(TeamLead);
  }, [chainError, account]);

  const checkMetamask = async () => {
    if (isMetaMaskInstalled) {
      if (window.ethereum.chainId === '0x13881') {
        const userAccount = await connect();
        console.log(userAccount);
        console.log(setAccount);
        setAccount(userAccount[0]);
      } else {
        setChainError('change to Mumbai Polygon');
        throw new Error('change to Mumbai Polygon');
      }
    } else {
      throw new Error('Install metamask');
    }
  };
  const getBalance = async myAccount => {
    const provider = getProvider();
    const balance = await provider.getBalance(myAccount);
    console.log(formatEther(balance));
    setMyBalance(formatEther(balance));
    return balance;
  };

  const TeamLeadContract = async () => {
    const signer = await getSigner();
    // Create a contract
    const TeamLeadContract = new Contract(
      "0xB0b72FB76a9390943A869eD2e837D183Cd44F954",
      TeamLead,
      signer
    );
    return TeamLeadContract;
  };

  const getTeamLead = async () => {
    try {
      const TeamLeadCon = await TeamLeadContract();
      console.log(TeamLeadCon);
      const currentTeamLead = await TeamLeadCon.getLead();
      setTeamLeadName(currentTeamLead);
      console.log(currentTeamLead);
    } catch (error) {
      console.log(error);
    }
  };
  const setTeamLead = async () => {
    try {
      const TeamLeadCon = await TeamLeadContract();
      console.log(TeamLeadCon);
      const tx = await TeamLeadCon.setLead(newTeamLead);
      const receipt = await tx.wait(1);
      console.log(receipt);
      if (receipt.status) {
        toast({
          position: 'bottom-left',
          render: () => (
            <Box color="white" p={3} bg="green.500">
              Transaction successful
            </Box>
          ),
        });
      }
      console.log(receipt);
    } catch (error) {
      console.log(error);
    }
  };

  const walletConnection = () => {
    try {
      checkMetamask();
    } catch (error) {
      console.log(error);
    }
  };

  const contract = new ethers.Contract("0xB0b72FB76a9390943A869eD2e837D183Cd44F954", TeamLead, getProvider);

  contract.on("Transfer", (from, to, amount, event) => {
    console.log({
      from: from,
      to: to,
      amount: amount.toString(),
      data: event
    });
  });

  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            {chainError && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Wrong Network!</AlertTitle>
                <AlertDescription>
                  Please change to Polygon Mumbai testnet
                </AlertDescription>
              </Alert>
            )}
            <Text>TeamLead app</Text>
            <Text>{account}</Text>
            <Text>{myBalance}</Text>
            <Button onClick={walletConnection} disabled={account}>
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
            <HStack spacing="30px">
              <Button onClick={getTeamLead}>Get Team Lead</Button>
              <Text>{TeamLeadName}</Text>
            </HStack>
            <HStack spacing="30px">
              <Input
                value={newTeamLead}
                onChange={e => setNewTeamLead(e.target.value)}
              ></Input>
              <Button onClick={setTeamLead}>Set Team Lead</Button>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}
export default App;
