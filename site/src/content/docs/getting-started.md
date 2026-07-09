---
title: Getting started
description: Install silver-ui and render your first components.
---

silver-ui is a complete, themeable React component library, built with
[Panda CSS](https://panda-css.com/).

## Installation

```bash
npm install silver-ui
# or
pnpm add silver-ui
# or
yarn add silver-ui
```

silver-ui requires **React 19+** as a peer dependency. Its other runtime
dependencies (`lucide-react`, `@js-temporal/polyfill`) install automatically.

## Usage

Import the stylesheet once in your app's entry point, then use components:

```tsx
import 'silver-ui/styles.css';
import {Button, Card, Heading, Text} from 'silver-ui';

function App() {
  return (
    <Card padding={4}>
      <Heading level={2}>Welcome back</Heading>
      <Text>Your project is ready to deploy.</Text>
      <Button
        label="Deploy"
        onClick={() => console.log('Deploying…')}
        size="md"
        variant="primary"
      />
    </Card>
  );
}
```

`Button` takes its text via the `label` prop (not children), which keeps it
accessible even in icon-only mode.

For smaller JS bundles, import component subpaths:

```tsx
import 'silver-ui/styles.css';
import {Button} from 'silver-ui/Button';
import {SideNav, SideNavItem} from 'silver-ui/SideNav';
```
