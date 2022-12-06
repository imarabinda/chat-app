import { combineReducers } from "redux";
import ConversationsSlice from "./common/reducers/ConversationsSlice";
import UsersSlice from "./common/reducers/UsersSlice";
const reducers = combineReducers({
  [UsersSlice.name]: UsersSlice.reducer,
  [ConversationsSlice.name]: ConversationsSlice.reducer,
});
export default reducers;
