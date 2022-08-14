import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Channel } from '../types/enums';
import i18n from '../configs/i18next.config.client';
import Root from './containers/Root';
import './index.global.css';

window.electron.ipcRenderer.on(Channel.LANGUAGE_CHANGED, (message) => {
  if (!i18n.hasResourceBundle(message.language, message.namespace)) {
    i18n.addResourceBundle(
      message.language,
      message.namespace,
      message.resource
    );
  }

  i18n.changeLanguage(message.language);
});

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <Suspense fallback={<div>Loading...</div>}>
    <Root />
  </Suspense>
);
