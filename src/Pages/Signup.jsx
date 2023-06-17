import React, { useState } from 'react';
import styled from 'styled-components';
import { LayoutStyle } from '../Styles/Layout';
import SignupAPI from '../Utils/SignupAPI';
import URL from '../Utils/URL';
import EmailValidAPI from '../Utils/EmailValidAPI';
import Button from '../Components/common/Button';
import Input from '../Components/common/Input';
// import ProfileSetting from '../Components/Profile/UserProfileSetting';
import ErrorMSG from '../Styles/ErrorMSG';
import profileImg from '../Assets/profile-lg.png';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [imgURL, setImgURL] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailPwCheck, setEmailPwCheck] = useState(false);
  const [userInfo, setUserInfo] = useState({
    user: {
      username: '',
      email: '',
      password: '',
      accountname: '',
      intro: '',
      image: '',
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      user: {
        ...prevState.user,
        [name]: value,
      },
    }));
    setErrorMessage('');
  };

  const handleEmailValid = async (e) => {
    const res = await EmailValidAPI({ user: { email: userInfo.user.email } });

    if (res) {
      setEmailError(res.message);
    }
  };

  const handleOnBlur = async () => {
    await handleEmailValid();
  };

  const handlePasswordValid = () => {
    if (userInfo.user.password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
    } else {
      setPasswordError('');
    }
  };

  const goNext = () => {
    if (userInfo.user.email && userInfo.user.password && !passwordError) {
      setEmailPwCheck(true);
    }
  };

  const handleImageInput = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    const res = await fetch(URL + '/image/uploadfile', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    console.log(json);
    setImgURL(URL + '/' + json.filename);
    setUserInfo({ ...userInfo, user: { ...userInfo.user, image: URL + '/' + json.filename } });
  };

  const handleSign = async () => {
    const res = await SignupAPI(userInfo);

    if (res) {
      setErrorMessage(res.message);

      if (res.message === '회원가입 성공') {
        navigate('/login');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSign();
  };

  return (
    <>
      {emailPwCheck ? (
        <UserSettingLayout>
          <Title>프로필 설정</Title>
          <Inform>나중에 언제든지 변경할 수 있습니다.</Inform>
          <Form onSubmit={handleSubmit}>
            <ImageLayout>
              <ImgLabel htmlFor='file-input'>
                <ProfileImg src={imgURL} />
              </ImgLabel>
              <input id='file-input' className='a11y-hidden' type='file' onChange={handleImageInput} />
            </ImageLayout>
            <Input
              label='사용자 이름'
              type='text'
              forId='name'
              placeholder='2~10자 이내여야 합니다.'
              mb={errorMessage ? '6px' : '16px'}
              value={userInfo.user.username}
              name='username'
              onChange={handleInputChange}
            ></Input>
            <Input
              label='계정 ID'
              type='text'
              forId='user-id'
              placeholder='영문, 숫자, 특수문자(.),(_)만 사용 가능합니다.'
              mb={errorMessage ? '6px' : '16px'}
              value={userInfo.user.accountname}
              name='accountname'
              onChange={handleInputChange}
            ></Input>
            {errorMessage === '영문, 숫자, 밑줄, 마침표만 사용할 수 있습니다.' && userInfo.user.accountname && (
              <ErrorMSG errorColor={errorMessage !== '사용 가능한 이메일 입니다.'}>{errorMessage}</ErrorMSG>
            )}
            {errorMessage === '이미 사용중인 계정 ID입니다.' && userInfo.user.accountname && (
              <ErrorMSG errorColor={errorMessage !== '사용 가능한 이메일 입니다.'}>{errorMessage}</ErrorMSG>
            )}
            <Input
              label='소개'
              type='text'
              forId='describe'
              placeholder='자신과 판매할 상품에 대해 소개해 주세요!'
              mb={errorMessage ? '6px' : '16px'}
              value={userInfo.user.intro}
              name='intro'
              onChange={handleInputChange}
            ></Input>
            {errorMessage === '이미 가입된 이메일 주소 입니다.' && (
              <ErrorMSG errorColor={errorMessage === '이미 가입된 이메일 주소 입니다.'}>{errorMessage}</ErrorMSG>
            )}
            <Button
              type='submit'
              width='322px'
              fontSize='14px'
              margin='10px 0 0 0'
              padding='13px 0'
              disabled={!userInfo.user.username || !userInfo.user.accountname || !userInfo.user.intro}
            >
              Tripillow 시작하기
            </Button>
          </Form>
        </UserSettingLayout>
      ) : (
        <SignupLayout>
          <Title>이메일로 회원가입</Title>
          <Form onSubmit={goNext}>
            <Input
              label='이메일'
              type='email'
              forId='email-input'
              placeholder='이메일 주소를 입력해 주세요.'
              autoComplete='off'
              mb={emailError ? '6px' : '16px'}
              value={userInfo.user.email}
              name='email'
              onBlur={handleOnBlur}
              onChange={handleInputChange}
            ></Input>
            {emailError && <ErrorMSG errorColor={emailError !== '사용 가능한 이메일 입니다.'}>{emailError}</ErrorMSG>}
            <Input
              label='비밀번호'
              type='password'
              forId='pw-input'
              placeholder='비밀번호를 설정해 주세요.'
              mb={passwordError ? '6px' : '30px'}
              autoComplete='off'
              value={userInfo.user.password}
              name='password'
              onBlur={handlePasswordValid}
              onChange={handleInputChange}
            ></Input>
            {passwordError && <ErrorMSG errorColor>{passwordError}</ErrorMSG>}
            <Button
              width='322px'
              fontSize='var(--sm)'
              padding='13px 0'
              disabled={
                !userInfo.user.email ||
                !userInfo.user.password ||
                emailError !== '사용 가능한 이메일 입니다.' ||
                passwordError
              }
              onClick={goNext}
            >
              다음
            </Button>
          </Form>
        </SignupLayout>
      )}
    </>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const SignupLayout = styled.div`
  ${LayoutStyle}

  padding: 30px 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin-bottom: 40px;
  font-size: var(--xxl);
`;

// 프로필 설정 styled-component
const UserSettingLayout = styled.div`
  ${LayoutStyle}
  padding: 30px 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Inform = styled.p`
  color: var(--dark-gray);
  font-size: var(--sm);
  margin-bottom: 30px;
`;

const ImageLayout = styled.div`
  width: 110px;
  height: 110px;
  margin: 0 auto 30px;
  position: relative;
`;

const ImgLabel = styled.label`
  display: block;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  background: url(${profileImg}) 0 0 / cover;
`;

export default Signup;
