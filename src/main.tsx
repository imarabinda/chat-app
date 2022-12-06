import "./styles/index.css";
import "emoji-mart/css/emoji-mart.css";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { persistor, store } from "./redux/store";
import { Provider } from "react-redux";
import { checkCookie } from "./shared/helpers";
import ConfigsProvider from "./lib/contexts/ConfigsContext";

let configs = {
  cookieEnabled: checkCookie(),
};

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConfigsProvider configs={configs}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigsProvider>
    </PersistGate>
  </Provider>,

  document.getElementById("root")
);
