import React, { useState } from 'react';
import './intro-screen.scss';
import { useSelector } from 'react-redux';
import TresorImage from 'bloben-common/assets/small.svg';

import Landing from '../../bloben-common/components/Landing';
import { useHistory } from 'react-router';
import { createDemoAccount } from '../../bloben-package/utils/authentication/registerAccount';
import DonateButton from '../../bloben-common/components/donateButton/donateButton';
import BitcoinButton from '../../bloben-common/components/bitcoinButton/bitcoinButton';
import BitcoinPopup from '../../bloben-common/components/bitcoinPopup/bitcoinPopup';
import CalendarText from '../../bloben-common/texts/calendar';
import DonateText from '../../bloben-common/texts/donate';
import CalendarImage from 'bloben-common/assets/calendar.png';
import DonateButtonPatreon
    from '../../bloben-common/components/donateButtonPatreon/donateButtonPatreon';

const AboutScreen = () => {
    return  <Landing.FreeLayout id={'about'} >
        <Landing.Subtitle subtitle={'Another calendar app?'} description={'What\'s so' +
        ' special?' +
        ' '}/>
        <Landing.ContainerRow>
            <Landing.ContainerRowPart>
                <Landing.Container>
                    <Landing.Body>
                        <CalendarText/>
                    </Landing.Body>
                </Landing.Container>
            </Landing.ContainerRowPart>
          <Landing.ContainerRowPart>
                    <img src={CalendarImage} style={{marginTop: 24, marginBottom: 24, height: '60%', width: '60%'}}/>
                </Landing.ContainerRowPart>

        </Landing.ContainerRow>
    </Landing.FreeLayout>
}

const DonateScreen = () => {
    const [popupIsVisible, openPopup] = useState(false);

    const handleOpenPopup = (): void =>
        openPopup(true);

    const handleClosePopup = (): void =>
        openPopup(false);

    return  <Landing.FreeLayout id={'donate'}>
        <Landing.Subtitle subtitle={'Donate'} description={'Where is it Philip? Where is my money?\n'}/>
        <Landing.ContainerRow>
            <Landing.ContainerRowPart>
                <Landing.Container>
                    <Landing.Body>
                      <DonateText/>
                    </Landing.Body>
                </Landing.Container>
            </Landing.ContainerRowPart>
            <Landing.ContainerRowPart>
                <Landing.Container>
                    <DonateButton/>
                    <Landing.Separator/>
                    <DonateButtonPatreon/>
                    <Landing.Separator/>
                    <BitcoinButton onClick={handleOpenPopup}/>
                </Landing.Container>
            </Landing.ContainerRowPart>
        </Landing.ContainerRow>
        {popupIsVisible ? <BitcoinPopup handleClose={handleClosePopup}/> : null}
    </Landing.FreeLayout>
}

const DesktopLayout = (props: any) => {
    const {navToLogin, navToRegister} = props;
    const isMobile: any = useSelector((state: any) => state.isMobile);
    const username: any = useSelector((state: any) => state.username);

    return  <Landing.Wrapper id={'intro_wrapper'}>
        <Landing.HeaderNavbar onDemoButtonClick={createDemoAccount} username={username} isMobile={isMobile}/>
        {/*//background={'#c5cae9ff'}*/}
        <Landing.OneScreen  id={'home'}>
            {isMobile
                ? <Landing.Subtitle subtitle={'Calendar'} description={'Encrypt your plans for' +
                ' free'}/>
            : <Landing.Subtitle subtitle={''} description={''}/> }
                <Landing.ContainerRow>
                    {!isMobile ? <Landing.ContainerRowPart>
               <Landing.Container>
                    <Landing.MainText>Encrypted Calendar</Landing.MainText>
                    <Landing.SubMainText>Hide your private plans for free</Landing.SubMainText>
                </Landing.Container>

            </Landing.ContainerRowPart> : null}
            <Landing.ContainerRowPart>
                <img src={TresorImage} style={{marginTop: 24, marginBottom: 24, height: '50%'}}/>

                {isMobile ? <div className={'intro__buttons-container'}>
                    <Landing.LoginButton wide/>
                    <Landing.Separator />
                    <Landing.RegisterButton wide/>
                </div> : <Landing.DemoButton onDemoButtonClick={createDemoAccount}/>}

            </Landing.ContainerRowPart>
        </Landing.ContainerRow>
        </Landing.OneScreen>
       <AboutScreen/>
       <DonateScreen/>
       <Landing.Separator/>
        <Landing.Separator/>
        <Landing.Separator/>
        <Landing.Separator/>
        <Landing.FooterExtended/>
        <Landing.Footer />
    </Landing.Wrapper>
}

const IntroScreen = () => {
    const isMobile: any = useSelector((state: any) => state.isMobile);
    const history: any = useHistory();

    const navToLogin = (): void =>
        history.push('/login');

    const navToRegister = (): void =>
        history.push('/register');

    return (
      isMobile ?
          <DesktopLayout navToRegister={navToRegister} navToLogin={navToLogin}/>
          : <DesktopLayout navToRegister={navToRegister} navToLogin={navToLogin}/>

  );
};

export default IntroScreen;
