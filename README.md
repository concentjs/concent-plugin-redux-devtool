### how to use
- step 1, install it
```bash
npm i concent-plugin-redux-devtool
```
- setp 2, config it to concent startupOption's plugins
```js
import { run } from 'concent';
import reduxDevToolPlugin from 'concent-plugin-redux-devtool';

// your store config
const storeConfig = {};

// your option
const startupOption = {
  plugins: [reduxDevToolPlugin]
};

run(storeConfig, startupOption);
```
>
- run your concent app, check your chrome redux dev-tool

![dev-tool-pic](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc-eco/cc-pic1.png)
> note that `committedState` is the whole state that committed by some one of your component refs, `sharedState` is the state that will save to store, they are different!
