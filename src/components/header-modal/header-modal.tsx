import React, {  useEffect, useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import './header-modal.scss';
import { useHistory } from 'react-router';
import TrashIcon from 'bloben-common/components/eva-icons/trash';
import StarIcon from '../../bloben-common/components/eva-icons/star';
import ArrowBack from '../../bloben-common/components/eva-icons/arrow-back';
import StarIconFilled from '../../bloben-common/components/eva-icons/star-filled';
import CheckIcon from '../../bloben-common/components/eva-icons/checkmark';
import { useSelector } from 'react-redux';
const Icons = (props: any) => props.icons.map((icon: any) => icon);

const HeaderModalMobile = (props: any) => {
  const {
    hasHeaderShadow,
    goBack,
    onDelete,
    handleFavourite,
    isFavourite,
    handleSave,
    title,
    icons,
    forceBackButton
  } = props;
  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const isDark: boolean = useSelector((state: any) => state.isDark);

  return (
    <div
      className={forceBackButton ? 'header-modal__forced-back-button' : `header-modal__row${
        hasHeaderShadow && isMobile ? '-shadow' : ''
      }
      `}
    >
      <div className={'header-modal__icon-left'}>
        {isMobile || forceBackButton ? (
          <IconButton onClick={goBack}>
            <ArrowBack className={`icon-svg${isDark ? '-dark' : ''}`} />
          </IconButton>
        ) : null}
      </div>
      <div className={'header-modal__container--title'}>
        <p className={`header-modal__title${isDark ? '-dark' : ''}`}>{title}</p>
      </div>
      <div className={'header-modal__container--icons'}>
        {handleSave ? (
          <IconButton onClick={handleSave}>
            <CheckIcon className={`icon-svg-primary${isDark ? '-dark' : ''}`} />
          </IconButton>
        ) : null}
        {onDelete ? (
          <IconButton onClick={onDelete}>
            <TrashIcon className={`icon-svg${isDark ? '-dark' : ''}`} />
          </IconButton>
        ) : null}
        {handleFavourite ? (
          <IconButton onClick={handleFavourite}>
            {isFavourite ? (
              <StarIconFilled
                className={`icon-svg-primary${isDark ? '-dark' : ''}`}
              />
            ) : (
              <StarIcon className={`icon-svg${isDark ? '-dark' : ''}`} />
            )}
          </IconButton>
        ) : null}
        {props.icons ? <Icons icons={props.icons} /> : null}
      </div>
    </div>
  );
};

const HeaderModalView = (props: any) => {
  const {
    hasHeaderShadow,
    icons,
    onClick,
    animation,
    goBack,
    onDelete,
    handleFavourite,
    isFavourite,
    handleSave,
    title,
    forceBackButton,
  } = props;
  const isDark: boolean = useSelector((state: any) => state.isDark);
  const isMobile: boolean = useSelector((state: any) => state.isMobile);

  return (
    <div
      className={`header-modal__wrapper${isDark ? '-dark' : ''} ${
        hasHeaderShadow && isMobile && !isDark ? 'with-shadow' : ''
      } `}
    >
      <div className={'header-modal__row'}>
        <HeaderModalMobile
          routeBack={props.routeBack}
          icons={icons}
          onClick={onClick}
          hasHeaderShadow={hasHeaderShadow}
          animation={animation}
          goBack={goBack}
          onDelete={onDelete}
          handleFavourite={handleFavourite}
          isFavourite={isFavourite}
          handleSave={handleSave}
          title={title}
          forceBackButton={forceBackButton}
        />
      </div>
    </div>
  );
};

const HeaderModal = (props: any) => {
  const {
    hasHeaderShadow,
    onClick,
    icons,
    handleDelete,
    handleFavourite,
    isFavourite,
    handleSave,
    title,
      onClose,
    forceBackButton
  } = props;
  const [animation, setAnimation] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (hasHeaderShadow) {
      setAnimation('header-modal__text-visible');
    } else {
      setAnimation('header-modal__text-hidden');
    }
    // tslint:disable-next-line
  }, [hasHeaderShadow]);

  const goBack = () => {
    if (onClose) {
      onClose()
    } else {
      history.goBack();
    }
  };

  const onDelete = () => {
    handleDelete();
    // goBack();
  };

  return (
    <HeaderModalView
      hasHeaderShadow={hasHeaderShadow}
      onClick={onClick}
      animation={animation}
      icons={icons}
      goBack={props.goBack ? props.goBack : goBack}
      onDelete={handleDelete ? onDelete : null}
      handleFavourite={handleFavourite}
      isFavourite={isFavourite}
      handleSave={handleSave}
      title={title}
      forceBackButton={forceBackButton}
    />
  );
};

export default HeaderModal;
