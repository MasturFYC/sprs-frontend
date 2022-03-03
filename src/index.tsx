import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { I18nProvider } from '@react-aria/i18n';

ReactDOM.render(
  <React.StrictMode>
    <Provider theme={defaultTheme} colorScheme={'light'}>
    <I18nProvider locale="id-ID">
      <App />
      </I18nProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
