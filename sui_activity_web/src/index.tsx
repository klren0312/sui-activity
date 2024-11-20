import { createRoot } from 'react-dom/client';
import { Main } from './main';
import '/@/assets/less/basic.less'


const container = document.querySelector('#root');
if (container) {
  const root = createRoot(container);

  root.render(<Main />);
}
