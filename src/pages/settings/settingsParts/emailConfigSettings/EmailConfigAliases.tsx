import {
  Button,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Context, StoreContext } from '../../../../context/store';
import { EvaIcons, Separator } from 'bloben-components';
import { TOAST_STATUS } from '../../../../types/enums';
import { createToast, parseCssDark } from '../../../../utils/common';
import { filter } from 'lodash';
import { getSize } from '../../../../types/constants';
import React, { useContext, useState } from 'react';
import Validator from '../../../../utils/Validator';

interface EmailConfigAliasesProps {
  aliases: string[];
  setLocalState: any;
  defaultAlias: string;
}
const EmailConfigAliases = (props: EmailConfigAliasesProps) => {
  const toast = useToast();
  const [store]: [StoreContext] = useContext(Context);

  const [newAlias, setNewAlias] = useState('');

  const { aliases, setLocalState, defaultAlias } = props;
  const tableSize = getSize(store.isMobile);

  const deleteAlias = (alias: string) => {
    if (aliases.length === 1) {
      toast(createToast('At least one alias is required', TOAST_STATUS.ERROR));

      return;
    }

    if (alias === defaultAlias) {
      toast(createToast('Cannot delete default alias', TOAST_STATUS.ERROR));

      return;
    }

    const filteredAliases = filter([...aliases], (item) => item !== alias);

    setLocalState('aliases', filteredAliases);
  };

  const addAlias = () => {
    const isEmail = Validator.isEmail(newAlias);

    if (!isEmail) {
      toast(createToast('Add valid email address', TOAST_STATUS.ERROR));

      return;
    }

    if (!aliases?.length) {
      setDefaultAlias(newAlias);
    }

    if (aliases?.length) {
      setLocalState('aliases', [...aliases, newAlias]);
    } else {
      setLocalState('aliases', [newAlias]);
    }

    setNewAlias('');
  };

  const setDefaultAlias = (alias: string) => {
    setLocalState('defaultAlias', alias);
  };

  return (
    <Flex direction={'row'}>
      <Flex direction={'column'}>
        <Text>Aliases</Text>
        <Separator height={4} />
        <Input
          size="md"
          name={'newAlias'}
          value={newAlias}
          placeholder={'Add alias'}
          onChange={(e: any) => {
            setNewAlias(e.target.value);
          }}
          onKeyPress={(e: any) => {
            if (e.key === 'Enter') {
              addAlias();
            }
          }}
        />
        <Separator height={10} />
        <Flex direction={'row'} maxWidth={600} flexWrap={'wrap'}>
          {aliases?.map((alias: string) => (
            <Tag
              key={alias}
              marginRight={4}
              borderRadius={10}
              padding={1}
              marginBottom={2}
              size={'xs'}
            >
              {alias}

              <IconButton
                aria-label={'delete-alias'}
                icon={
                  <EvaIcons.Cross
                    className={parseCssDark('HeaderModal__icon', store.isDark)}
                  />
                }
                onClick={() => deleteAlias(alias)}
              />
            </Tag>
          ))}
        </Flex>
        <Separator height={10} />

        <Text>Default alias</Text>
        <Menu>
          <MenuButton
            as={Button}
            _focus={{ boxShadow: 'none' }}
            size={tableSize}
          >
            {defaultAlias}
          </MenuButton>
          <MenuList>
            {aliases?.map((item) => {
              return (
                <MenuItem key={item} onClick={() => setDefaultAlias(item)}>
                  {item}
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default EmailConfigAliases;
