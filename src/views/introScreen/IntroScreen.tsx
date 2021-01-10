import React, { useState } from 'react';
import './IntroScreen.scss';
import { useSelector } from 'react-redux';
import TresorImage from 'bloben-common/assets/small.svg';

import { createDemoAccount } from '../../bloben-package/utils/registerAccount';
import CalendarText from '../../bloben-common/texts/calendar';
import DonateText from '../../bloben-common/texts/donate';
import CalendarImage from 'bloben-common/assets/calendar.png';
import Landing from 'bloben-common/components/landing/Landing';
import DonateButton from '../../bloben-common/components/donateButton/DonateButton';
import DonateButtonPatreon from '../../bloben-common/components/donateButtonPatreon/DonateButtonPatreon';
import BitcoinButton from '../../bloben-common/components/bitcoinButton/BitcoinButton';
import BitcoinPopup from '../../bloben-common/components/bitcoinPopup/BitcoinPopup';

const AboutScreen = () => (
  <Landing.FreeLayout id={'about'}>
    <Landing.Subtitle
      subtitle={'Another calendar app?'}
      description={"What's so" + ' special?' + ' '}
    />
    <Landing.ContainerRow>
      <Landing.ContainerRowPart>
        <Landing.Container>
          <Landing.Body>
            <CalendarText />
          </Landing.Body>
        </Landing.Container>
      </Landing.ContainerRowPart>
      <Landing.ContainerRowPart>
        <img
          src={CalendarImage}
          style={{
            marginTop: 24,
            marginBottom: 24,
            height: '60%',
            width: '60%',
          }}
        />
      </Landing.ContainerRowPart>
    </Landing.ContainerRow>
  </Landing.FreeLayout>
);

const DonateScreen = () => {
  const [popupIsVisible, openPopup] = useState(false);

  const handleOpenPopup = (): void => openPopup(true);

  const handleClosePopup = (): void => openPopup(false);

  return (
    <Landing.FreeLayout id={'donate'}>
      <Landing.Subtitle
        subtitle={'Donate'}
        description={'Where is it Philip? Where is my money?\n'}
      />
      <Landing.ContainerRow>
        <Landing.ContainerRowPart>
          <Landing.Container>
            <Landing.Body>
              <DonateText />
            </Landing.Body>
          </Landing.Container>
        </Landing.ContainerRowPart>
        <Landing.ContainerRowPart>
          <Landing.Container>
            <DonateButton />
            <Landing.Separator />
            <DonateButtonPatreon />
            <Landing.Separator />
            <BitcoinButton onClick={handleOpenPopup} />
          </Landing.Container>
        </Landing.ContainerRowPart>
      </Landing.ContainerRow>
      {popupIsVisible ? <BitcoinPopup handleClose={handleClosePopup} /> : null}
    </Landing.FreeLayout>
  );
};

// @ts-ignore
const isReactNative: boolean = window.ReactNativeWebView;

const DesktopLayout = () => {
  const isMobile: any = useSelector((state: any) => state.isMobile);
  const username: any = useSelector((state: any) => state.username);

  return (
    <Landing.Wrapper id={'intro_wrapper'}>
      <Landing.HeaderNavbar
        onDemoButtonClick={createDemoAccount}
        username={username}
        isMobile={isMobile}
      />
      {/*//background={'#c5cae9ff'}*/}
      <Landing.OneScreen id={'home'}>
        {isMobile ? (
          <Landing.Subtitle
            subtitle={'Calendar'}
            description={'Encrypt your plans for' + ' free'}
          />
        ) : (
          <Landing.Subtitle subtitle={''} description={''} />
        )}
        <Landing.ContainerRow>
          {!isMobile ? (
            <Landing.ContainerRowPart>
              <Landing.Container>
                <Landing.MainText>Encrypted Calendar</Landing.MainText>
                <Landing.SubMainText>
                  Hide your private plans for free
                </Landing.SubMainText>
              </Landing.Container>
            </Landing.ContainerRowPart>
          ) : null}
          <Landing.ContainerRowPart>
            <img
              src={TresorImage}
              style={{ marginTop: 24, marginBottom: 24, height: '50%' }}
            />

            {isMobile ? (
              <div className={'intro__buttons-container'}>
                <Landing.LoginButton wide />
                <Landing.Separator />
                <Landing.RegisterButton wide />
              </div>
            ) : (
              <Landing.DemoButton onDemoButtonClick={createDemoAccount} />
            )}
          </Landing.ContainerRowPart>
        </Landing.ContainerRow>
      </Landing.OneScreen>
      <AboutScreen />
      {isReactNative ? null : <DonateScreen />}
      <Landing.Separator />
      <Landing.Separator />
      <Landing.Separator />
      <Landing.Separator />
      <Landing.FooterExtended />
      <Landing.Footer />
    </Landing.Wrapper>
  );
};

const IntroScreen = () => {
  const isMobile: any = useSelector((state: any) => state.isMobile);

  return isMobile ? (
    <DesktopLayout />
  ) : (
    <DesktopLayout />
  );
};

export default IntroScreen;
