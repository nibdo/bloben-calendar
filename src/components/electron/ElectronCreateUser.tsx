import {
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { Context, StoreContext } from '../../context/store';
import { Heading } from '@chakra-ui/react';
import { Separator } from 'bloben-components';
import { setUser } from '../../redux/actions';
import { useDispatch } from 'react-redux';
import ElectronApi from '../../api/ElectronApi';
import ProfileApi from '../../api/ProfileApi';
import React, { useContext, useState } from 'react';

const ElectronCreateUser = () => {
  const toast = useToast();
  const [, dispatch]: [StoreContext, any] = useContext(Context);

  const setContext = (type: string, payload: any) => {
    dispatch({ type, payload });
  };

  const reduxDispatch = useDispatch();

  const [username, setUsername] = useState('');

  const onChange = (e: any) => {
    setUsername(e.target.value);
  };

  const handleClick = async () => {
    try {
      const response = await ElectronApi.createUser({
        username,
      });

      if (response.status === 200) {
        const userResponse = await ProfileApi.getProfile();

        setContext('isLogged', true);

        if (userResponse?.data?.id) {
          setContext('isLogged', true);
          setContext('isAppStarting', false);
          reduxDispatch(setUser(userResponse?.data));
        }
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        toast({
          title: e.response?.data?.message,
          status: 'error',
        });
      }

      setContext('isAppStarting', false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        background: 'white',
      }}
    >
      <Container width={400}>
        <Heading as="h2" size="2xl">
          Create user
        </Heading>
        <Separator height={24} />
        <FormControl id="username" size="2xl">
          <FormLabel size="2xl">Username</FormLabel>
          <Input
            size="lg"
            name={'username'}
            value={username}
            onChange={onChange}
          />
        </FormControl>
        <Separator height={40} />
        <Center>
          <Button onClick={handleClick} colorScheme="teal" size="md">
            Confirm
          </Button>
        </Center>
      </Container>
    </div>
  );
};

export default ElectronCreateUser;
