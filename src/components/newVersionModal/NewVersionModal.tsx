import { Context } from '../../context/store';
import { Link, Text } from '@chakra-ui/react';
import ChakraModal from '../chakraCustom/ChakraModal';
import React, { useContext } from 'react';
import Separator from 'components/separator/Separator';
interface NewVersionModalProps {
  handleClose: any;
}
const NewVersionModal = (props: NewVersionModalProps) => {
  const [store] = useContext(Context);

  const { latestVersion } = store;

  const { handleClose } = props;

  return (
    <ChakraModal
      isOpen={true}
      handleClose={handleClose}
      minWidth={350}
      title={`New version available ${String(latestVersion)}`}
    >
      <>
        <Text>
          {/*@ts-ignore*/}
          Your current version {String(process?.env?.APP_VERSION)} is outdated.
        </Text>
        <Separator height={24} />
        <Text>
          To update version, run script update.sh in root directory. For more,
          visit{' '}
          <Link
            _focus={{ boxShadow: 'none' }}
            target={'_blank'}
            color={'primary.400'}
            href={'https://docs.bloben.com/docs/updates'}
          >
            update instructions
          </Link>
        </Text>
        <Separator height={24} />
        <Link
          _focus={{ boxShadow: 'none' }}
          target={'_blank'}
          color={'primary.400'}
          href={
            'https://github.com/nibdo/bloben-app/blob/production/CHANGELOG.md'
          }
        >
          Changelog
        </Link>
      </>
    </ChakraModal>
  );
};

export default NewVersionModal;
