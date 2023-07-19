import { useState, useEffect } from "react";
import styled from "styled-components";
import imgUrl from "../Constant";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import app from "../firebase";

const Navbar = () => {
  const { pathname } = useLocation();

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const initialUserData = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData"))
    : {};

  const [userData, setUserData] = useState(initialUserData);

  const handleAuth = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // console.log(result.user);
        // console.log(result.user.photoURL);
        setUserData(result.user);
        localStorage.setItem("userData", JSON.stringify(result.user));
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // console.log(user);
      if (!user) {
        navigate("/login");
      } else if (user && pathname === "/login") {
        navigate("/");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [pathname]);

  const [show, setShow] = useState(false);
  // console.log("show", show);

  const listener = () => {
    if (window.scrollY > 50) {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, []);

  const pikachuId = 25;
  const img = `${imgUrl}/${pikachuId}.png`;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUserData({});
      })
      .catch((error) => {
        alert(error.message);
      });
    localStorage.removeItem("userData");
  };

  return (
    <NavWrapper show={show}>
      <Logo>
        <Image
          alt="Poke logo"
          src={img}
          onClick={() => {
            window.location.href = "/";
          }}
        ></Image>
      </Logo>
      {pathname === "/login" ? (
        <Login onClick={handleAuth}>로그인</Login>
      ) : (
        <SignOut>
          <UserImg src={userData.photoURL} alt="user photo" />
          <Dropdown>
            <span onClick={handleLogout}>로그아웃</span>
          </Dropdown>
        </SignOut>
      )}
    </NavWrapper>
  );
};

const NavWrapper = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  background-color: ${(props) => (props.show ? "#090b13" : "transparent")};
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  letter-spacing: 16px;
  z-index: 100;
`;

const Logo = styled.a`
  padding: 0;
  width: 50px;
  margin-top: 4px;
`;

const Image = styled.img`
  cursor: pointer;
  width: 100%;
`;

const Login = styled.a`
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  text-transform: uppercase;
  letter-spacing: 1.55px;
  border: 1px solid #f9f9f9;
  border-radius: 4px;
  transition: all 0.2s ease 0s;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #f9f9f9;
    color: #000;
    border-color: transparent;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 48px;
  right: 0px;
  background: rgb(19, 19, 19);
  border: 1px solid rgba(151, 151, 151, 0.34);
  border-radius: 4px;
  box-shadow: rgb(0, 0, 0 / 50%) 0px 0px 18px 0px;
  padding: 10px;
  font-size: 14px;
  letter-spacing: 3px;
  width: 100px;
  opacity: 0;
  color: white;
  text-align: center;
`;

const SignOut = styled.div`
  position: relative;
  height: 48px;
  width: 48px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  &:hover {
    ${Dropdown} {
      opacity: 1;
      transition-duration: 1s;
    }
  }
`;

const UserImg = styled.img`
  border-radius: 50%;
  width: 100%;
  height: 100%;
`;

export default Navbar;
