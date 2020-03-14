import React,{Component} from 'react';
import Main from './Components/MainComponent';
import { Provider } from 'react-redux';
import { ConfigureStore } from './redux/configureStore';
import { PersistGate } from 'redux-persist/es/integration/react'
import { Loading } from './Components/LoadingComponent';

const { persistor, store } = ConfigureStore();

class App extends Component {
  render() {
    return (
      <Provider store={store}>
      <PersistGate 
        loading={<Loading />}
        persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
    );
  }
}
export default App;