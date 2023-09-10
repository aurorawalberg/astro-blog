---
author: Aurora Walberg
pubDatetime: 2023-09-10T15:22:00Z
title: Running tests on internationalized React Server Components in Next.js 13
postSlug: test-i18n-next13
featured: true
draft: false
tags:
  - React Server Components
  - Next.js
  - Testing
  - i18n
ogImage: ""
description:
  This post documents a method I found to work for running tests with Vitest and RTL on internationalized React Server Components using next-international in Next.js 13.
---

This post documents a method I found to work for running tests with Vitest and RTL on internationalized React Server Components using next-international in Next.js 13.

## Table of contents

## Introduction

Testing is a crucial part of any software development process, ensuring that your code functions as expected and maintains its integrity as your application evolves. In this blog post, I'll walk you through the process of running tests with Vitest and RTL (React Testing Library) in a Next.js 13 app using app router that utilizes internationalization (i18n) via the next-international package.

## Pre-requisites

This method applies to an existing Next.js 13 app that uses app router and next-international for i18n. If you don't have an existing app, you can create a starter app using the following command:

```bash
npx create-next-app@latest
```

### Setting up next-international

To set up next-international, follow the steps in the [next-international documentation](https://www.npmjs.com/package/next-international). After doing it correctly, you will have:

- A `/src/locales` folder, containing [locale].ts files for each locale you want to support, as well as a `client.ts` and `server.ts` exporting i18n functions.
- Locale based routing using a `/src/app/[locale]/` dynamic route.
- A `/src/middleware.js` file containing middleware for setting the locale based on the route and rewriting urls.
- A modified `next.config.js` file containing transpile packages for next-international.

### Setting up Vitest

Vitest is a testing framework for React Server Components. It is built on top of Jest and React Testing Library. To set up Vitest, follow the steps in for example [this blogpost](https://dev.to/azadshukor/setting-up-nextjs-13-with-vitest-51ol).

Make sure your vitest config file looks something like this:

```js
// vitest.config.js
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/setupTests.ts',
  },
});
```

Notice especially the `setupFiles` property, which points to a file that will be run before each test. Create this file inside the `/src` folder (or at the root if not using a `/src`  folder) and add the following code:

```ts
// src/setupTests.ts
import '@testing-library/jest-dom';
```

Now we have set up Vitest with Jest and React Testing Library. We will configure this file further later.

## Testing React Server Components

Lets say we have an async React Server Component called `HelloWorld.tsx` that we want to test. It looks something like this:

```tsx
// src/components/HelloWorld.tsx
export default async function HelloWorld() {
  return (
    <div>
      <h1 data-testid="hello-world">Hello World</h1>
    </div>
  );
}

```

Let's write a test for this component. We create a file called `HelloWorld.test.tsx`.

```tsx
// src/components/tests/HelloWorld.test.tsx
import { screen, render } from '@testing-library/react';
import HelloWorld from '../HelloWorld';

describe('HelloWorld', () => {
  it('renders ', async () => {
    render(<HelloWorld />);

    expect(screen.getByTestId('hello-world')).toHaveTextContent('Hello World');
  });
});
```

We run the test using the following command:

```bash
npm run test
```

The test fails with the following error:

```bash
Error: Objects are not valid as a React child (found: [object Promise]). If you meant to render a collection of children, use an array instead.
```

This is because the component is async, and we need to use `await` to get the component before we can render it. At the moment there is not a lot of documentation on testing React Server Components, but there is an ongoing discussion on the [RTL GitHub](https://github.com/testing-library/react-testing-library/issues/1209). For now I am using a workaround from there by *caleb531*. We need to create a custom render function that uses `await` to get the component before rendering it. Using it results in the following modified test:

```tsx  
// src/components/tests/HelloWorld.test.tsx
...
import { renderServerComponent } from '@/test-utils/renderServerComponent';

describe('HelloWorld', () => {
  it('renders ', async () => {
    await renderServerComponent(<HelloWorld />);

    expect(screen.getByTestId('hello-world')).toHaveTextContent('Hello World');
  });
});
```

Now the test passes! We can also use the `renderServerComponent` function to test other async React Server Components.

## Testing internationalized React Server Components

Next-international provides methods for getting the current locale and setting the locale. It also provides `useI18n()` (for client components) and `getI18n()` (async method for server components) functions and hooks that can be used to translate text in your app.

Now let's say we have an internationalized React Server Component called `HelloWorld.tsx` that we want to test. It looks something like this:

```tsx
// src/components/HelloWorld.tsx
import { getI18n } from '@/locales/server';

export default async function HelloWorld() {
  const t = await getI18n();

  return (
    <div>
      <h1 data-testid="hello-world">{t('helloWorld')}</h1>
    </div>
  );
}
```

This component calls the async `getI18n()` function from next-international to get the current locale and use it to translate the text. The `getI18n()` function is async, so we need to use `await` to get the locale before we can use it. That means we need an async component as well.

When running the test, we get the following error:

```bash
This module cannot be imported from a Client Component module. It should only be used from a Server Component.
```

Let's solve this problem by mocking the `getI18n()` function inside our test. We can use the `vi.mock()` function from Vitest to mock the `getI18n()` function. Then, lets return the translation directly from the mock. The test now looks like this:

```tsx
// src/components/tests/HelloWorld.test.tsx
...
import { vi } from 'vitest';
import en from '@/locales/en';

vi.mock('@/locales/server', async () => {
  return {
    getI18n: () => {
      return (str: string) => {
        return en[str as keyof typeof en];
      };
    },
  };
});

describe('HelloWorld', () => {
  it('renders ', async () => {
    await renderServerComponent(<HelloWorld />);

    expect(screen.getByTestId('hello-world')).toHaveTextContent('Hello World');
  });
});

```

And it runs again! Let's mock all the next-international functions we need to use in our test. Move the vi.mock() logic to the `src/setupTests.ts` file, and add mocks for the rest of the exported functions, including the client side hooks:

```ts
beforeEach(() => {
  vi.mock('@/locales/server', async () => {
    return {
      getCurrentLocale: () => {
        return 'en';
      },
      getI18n: () => {
        return (str: string) => {
          return en[str as keyof typeof en];
        };
      },
      getScopedI18n: () => {
        return (str: string) => {
          return en[str as keyof typeof en];
        };
      },
      getStaticParams: () => {
        return {};
      },
    };
  });

  vi.mock('@/locales/client', async () => {
    return {
      useChangeLocale: () => {
        return () => {
          return;
        };
      },
      useCurrentLocale: () => {
        return 'en';
      },
      useI18n: () => {
        return (str: string) => {
          return en[str as keyof typeof en];
        };
      },
      useScopedI18n: () => {
        return (str: string) => {
          return en[str as keyof typeof en];
        };
      },
      useStaticParams: () => {
        return {};
      },
    };
  });
});

afterEach(() => {
  cleanup();
});
```

That's it! Now we can test our internationalized React Server Components. This method ensures you can control the locale you are testing with, and that the locale is set before the component is rendered. Of course this also allows us to test client component using the mocks.

## Conclusion

In this blog post, we have learned how to run tests with Vitest and RTL on internationalized React Server Components using next-international in Next.js 13. We have also learned how to mock the next-international functions we need to use in our tests. I hope this blog post has been helpful to you. Happy testing!
