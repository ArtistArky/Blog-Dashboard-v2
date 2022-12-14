import React, { useEffect, useState } from "react";
import Header from "components/template/Header";
import SidePanel from "components/template/SidePanel";
import UserDropdown from "components/template/UserDropdown";
import SideNavToggle from "components/template/SideNavToggle";
import MobileNav from "components/template/MobileNav";
import SideNav from "components/template/SideNav";
import { Button } from "components/ui";
import View from "views";
import { sbAuthor } from "services/ApiService";
import { Error } from "components/ui";
import {
  initialState,
  setAuthorData,
  updateOnboard,
} from "store/userData/authorSlice";
import { setEmpty } from "store/userData/postSlice";
import { setEmptyC } from "store/userData/categorySlice";
import { setEmptyN } from "store/userData/navSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import supabaseClient from "utils/supabaseClient";

const HeaderActionsStart = () => {
  return (
    <>
      <MobileNav />
      <SideNavToggle />
    </>
  );
};

const HeaderActionsEnd = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mr-5">
        <SidePanel />
      </div>
      <div className="mr-3">
        <Button
          onClick={() => navigate("/app/create-post")}
          size="sm"
          variant="solid"
          type="submit"
        >
          <b className="text-20">+</b>&nbsp;&nbsp;Create
        </Button>
      </div>
      <UserDropdown hoverable={false} />
    </>
  );
};

const ModernLayout = (props) => {
  const dispatch = useDispatch();

  var author = useSelector((state) => state.userData.author);

  const [error, setError] = useState(false);

  const authID = useSelector((state) => state.auth.user.id);

  const checkAuthor = async () => {
    console.log(author);
    console.log(initialState);
    if (JSON.stringify(author) === JSON.stringify(initialState)) {
      console.log("I");
      fetchAuthorData();
    } else if (author.username === null) {
      console.log("O");
      dispatch(updateOnboard(false));
    } else {
      console.log("U");
      dispatch(updateOnboard(true));
    }
  };

  const fetchAuthorData = async () => {
    console.log(authID);
    await sbAuthor(authID).then(({ data, error }) => {
      if (error) {
        throw setError(true);
      }
      if (data) {
        setError(false);
        author = data[0];
        var actualD = {
          ...data[0],
          cus_domain_d: [
            { name: "API Hit", status: null },
            { name: "DNS", status: null },
            { name: "Resolving", status: null },
            { name: "SSL", status: null },
          ],
        };
        dispatch(setAuthorData(actualD));
        checkAuthor();
      }
    });
  };

  useEffect(() => {
    window.onbeforeunload = function () {
      console.log("In onbeforeunload");
      dispatch(setEmpty());
      dispatch(setEmptyC());
      dispatch(setEmptyN());
    };
  }, []);

  useEffect(() => {
    checkAuthor();
  }, []);

  if (error === true) {
    return <Error />;
  } else {
    const onboardStatus = author.onboard;
    return (
      <div className="app-layout-modern flex flex-auto flex-col">
        <div className="flex flex-auto min-w-0">
          {onboardStatus === true && <SideNav />}
          <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <Header
              className="border-b border-gray-200 dark:border-gray-700"
              headerEnd={<HeaderActionsEnd />}
              headerStart={onboardStatus === true && <HeaderActionsStart />}
            />
            <View {...props} />
          </div>
        </div>
      </div>
    );
  }
};

export default ModernLayout;
