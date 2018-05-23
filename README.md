# pacman-react

Pacman game written as a React component

## Dependencies

To build this project, run:

- `npm install && npm run build`

Note that `rsync` is required.

### Testing

Tests are written in the Mocha framework. To run them:

- `npm test`

## Use as a dependency

To use `pacman-react` as a dependency, run (in your project)

`npm install -S pacman-react`

Then you can do something like the following:

```js
import { render } from 'react-dom';
import Pacman from 'pacman-react';

render(<Pacman />, document.getElementById('root'));
```

Note that you will need a loader to handle sass files with an `scss` extension. Webpack with `sass-loader` should suffice.

## Development

To run a development server:

- `npm run dev`

This has hot module replacement so you can work on files in the `src/Pacman` directory and they should be updated on the fly.

