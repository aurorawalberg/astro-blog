---
author: Aurora Walberg
pubDatetime: 2023-12-12T15:22:00Z
title: Implementing React Hook Form with Next.js 14 and Server Actions
postSlug: implementing-react-hook-form-with-nextjs-14-and-server-actions
featured: true
draft: false
tags:
  - React Server Components
  - Next.js
  - React Hook Form
  - Server Actions
ogImage: ""
description:
  React Hook Form is a popular library for building interactive forms in React. In this blog post, I'll explain how to use React Hook Form with Next.js 14 and Server Actions.
---

React Hook Form is a popular library for building forms in React. In this blog post, I'll explain how to use React Hook Form with Next.js 14 and Server Actions.

There seems to be a lack of documentation on this topic, so I hope this blog post will be helpful to you. There also seems to be a misconception that we do not need React Hook Form now that we have the new React hooks such as `useFormStatus()` and `useFormState()`. However, React Hook Form still provides a lot of features that are not supported here, such as interactive client-side validation.

We are going to be using Zod for validation and Prisma for our database. We will also be using Toast for displaying error messages. Lastly, we will use the new React hook `useOptimistic()` to add optimistic UI in the end.

## Table of contents

## Pre-requisites

This method applies to an existing Next.js 13 or 14 app that uses the App Router. If you don't have an existing app, you can create a starter app using the following command:

```bash
npx create-next-app@latest
```

### Setting up React Hook Form

### Setting up Toast

### Setting up Prisma

## Making a React Hook Form

## Submitting with Server Actions

## Adding client-side validation

## Adding server-side validation

## Adding optimistic UI

## Conclusion

In this blog post, I walked you through what React Hook Form is and how to use it with Next.js 14 and Server Actions to make an interactive and user-friendly form. I hope you found this blog post helpful!
