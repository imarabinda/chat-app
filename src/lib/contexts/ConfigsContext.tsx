import { Provider } from "react-redux/es/exports";
import React from "react";
import PropTypes from "prop-types";
import deepmerge from "deepmerge";
import { checkCookie } from "../../shared/helpers";

/* Creating a context. */
export const ConfigsContext = React.createContext(
  {} as ReturnType<typeof useConfigsProvider>
);

export default function ConfigsProvider(props: any) {
  const configs = useConfigsProvider();
  return (
    <ConfigsContext.Provider value={configs}>
      {props.children}
    </ConfigsContext.Provider>
  );
}

/* Exporting the Consumer of the Context. */
export const ConfigsConsumer = ConfigsContext.Consumer;

export function useConfigs() {
  return React.useContext(ConfigsContext);
}
export interface ConfigsContext{
  isCookieEnabled:boolean;
}

function useConfigsProvider(): ConfigsContext {
  return {
    isCookieEnabled:checkCookie(),
  };
}
