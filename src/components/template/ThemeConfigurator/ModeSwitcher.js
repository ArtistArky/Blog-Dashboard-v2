import React, { useCallback, useState } from "react";
import useDarkMode from "utils/hooks/useDarkMode";
import { Switcher } from "components/ui";
import { BiSun } from "react-icons/bi";
import { BsMoonFill } from "react-icons/bs";

const ModeSwitcher = () => {
  const [isDark, setIsDark] = useDarkMode();
  console.log(isDark);

  const [mode, setMode] = useState(isDark);

  const onSwitchChange = useCallback(
    (checked) => {
      setIsDark(checked ? "dark" : "light");
      setMode(checked ? "dark" : "light");
    },
    [setIsDark]
  );

  const toggle = () => {
    if (mode === "light") {
      onSwitchChange(true);
    } else {
      onSwitchChange(false);
    }
  };

  return (
    <div className="cursor-pointer" onClick={toggle}>
      {mode === "light" ? <BiSun size={25} /> : <BsMoonFill size={22} />}
      {/* <Switcher
        defaultChecked={isDark}
        onChange={(checked) => onSwitchChange(checked)}
      /> */}
    </div>
  );
};

export default ModeSwitcher;
