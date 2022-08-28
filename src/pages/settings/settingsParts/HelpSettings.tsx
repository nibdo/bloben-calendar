import { Box, Link, Text } from '@chakra-ui/react';
import { Context } from '../../../context/store';
import { getSize } from '../../../types/constants';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext } from 'react';
import Separator from '../../../components/separator/Separator';
import SettingsCard from '../settingsCard/SettingsCard';

const HelpSettings = () => {
  const [store] = useContext(Context);

  const { isMobile } = store;
  const size = getSize(isMobile);

  return (
    <>
      {isMobile ? <MobilePageHeader title={'Help'} /> : null}
      <Box style={{ padding: isMobile ? 12 : 0 }}>
        <SettingsCard title={'Help'}>
          <Text fontSize={size}>
            If you have problem with application or found bug, feel free to
            contact us.
          </Text>
          <Separator height={8} />
          <Text fontSize={size}>
            You can open new issue at{' '}
            <Link
              _focus={{ boxShadow: 'none' }}
              target={'_blank'}
              size={size}
              color={store.isDark ? 'pink.300' : 'pink.500'}
              href={'https://github.com/nibdo/bloben-app/issues'}
              onClick={() =>
                window.open(
                  'https://github.com/nibdo/bloben-app/issues',
                  '_blank'
                )
              }
            >
              Github
            </Link>
            .
          </Text>
          <Separator />
        </SettingsCard>
      </Box>
    </>
  );
};

export default HelpSettings;
